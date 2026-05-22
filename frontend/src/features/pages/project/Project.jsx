import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProject } from "../../hooks/useProject";
import { useLocation } from "react-router-dom";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../../config/socket";
import Markdown from "markdown-to-jsx";
import { getWebContainer } from "../../config/webContainer";
import CodeEditor from "../../components/CodeEditor";
import FileExplorer from "../../components/FileExplorer";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);
  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set()); // Initialized as Set
  const [project, setProject] = useState(location.state.project);

  const [message, setMessage] = useState("");
  const { user, getAllUsers } = useAuth();
  const { getProject, updateFileTree, addUser } = useProject();

  const messageBox = React.createRef();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]); // New state variable for messages
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [creationMode, setCreationMode] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [selectedDir, setSelectedDir] = useState("");

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    addUser(location.state.project._id, Array.from(selectedUserId))
      .then((data) => {
        console.log(data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const send = () => {
    sendMessage("project-message", {
      message,
      sender: user,
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
    setMessage("");
  };

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);

    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("container started");
      });
    }

    receiveMessage("project-message", (data) => {
      console.log(data);

      // Normalize sender, handling potential backend inconsistency
      const sender = data.sender || data.user;
      data.sender = sender;

      if (sender?._id == "ai") {
        // Clean up markdown code blocks if present // turbo
        let validJson = data.message;
        if (validJson.trim().startsWith("```")) {
          validJson = validJson
            .replace(/^```(\w+)?/, "")
            .replace(/```$/, "")
            .trim();
        }

        try {
          const message = JSON.parse(validJson);

          console.log(message);

          webContainer?.mount(message.fileTree);

          if (message.fileTree) {
            setFileTree(message.fileTree || {});
          }

          // Store the cleaned message so rendering doesn't fail
          data.message = validJson;
          setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
        } catch (error) {
          console.error("Failed to parse AI message", error);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
      }
    });

    getProject(location.state.project._id).then((data) => {
      console.log(data.project);

      setProject(data.project);
      setFileTree(data.project.fileTree || {});
    });

    getAllUsers()
      .then((data) => {
        setUsers(data.users);
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveFileTree(ft) {
    //Guard - never fire without a valid tree
    if (!ft || typeof ft !== "object") return;

    updateFileTree(project._id, ft)
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error("[saveFileTree]", err);
      });
  }

  // eslint-disable-next-line no-unused-vars
  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  const handleCreateNewItem = () => {
    // Guard — do nothing if name is empty
    if (!newItemName.trim()) {
      setCreationMode(null);
      return;
    }

    // Sanitise: strip leading/trailing slashes and whitespace
    const cleanName = newItemName.trim().replace(/^\/+|\/+$/g, "");

    // Build full path: prefix with selectedDir if one is active
    // e.g. selectedDir = "src", cleanName = "Button.jsx" → "src/Button.jsx"
    const fullPath = selectedDir ? `${selectedDir}/${cleanName}` : cleanName;

    const newTree = { ...fileTree };

    if (creationMode === "file") {
      newTree[fullPath] = { file: { contents: "" } };
    } else if (creationMode === "folder") {
      newTree[fullPath] = { directory: {} };
    }

    setFileTree(newTree);
    saveFileTree(newTree); // pass newTree explicitly — fixes TD-01
    setCurrentFile(creationMode === "file" ? fullPath : currentFile);

    if (creationMode === "file") {
      setOpenFiles((prev) => [...new Set([...prev, fullPath])]);
    }

    setCreationMode(null);
    setNewItemName("");
  };

  const deleteItem = (itemPath) => {
    const newTree = { ...fileTree };

    // Delete the item itself
    delete newTree[itemPath];

    // If it was a directory, also delete all children
    // (keys that start with "itemPath/")
    const childPrefix = `${itemPath}/`;
    Object.keys(newTree).forEach((key) => {
      if (key.startsWith(childPrefix)) {
        delete newTree[key];
      }
    });

    setFileTree(newTree);
    saveFileTree(newTree); // pass explicitly — fixes TD-01

    // Close any tabs that were inside the deleted path
    const affectedFiles = openFiles.filter(
      (f) => f === itemPath || f.startsWith(childPrefix),
    );

    if (affectedFiles.length > 0) {
      const remainingOpen = openFiles.filter(
        (f) => f !== itemPath && !f.startsWith(childPrefix),
      );
      setOpenFiles(remainingOpen);

      // If current file was deleted, switch to last remaining open file
      if (affectedFiles.includes(currentFile)) {
        setCurrentFile(remainingOpen[remainingOpen.length - 1] || null);
      }
    }
  };

  return (
    <main className="h-screen w-screen flex bg-gray-950">
      {/* Left Pane: Chat & Collaboration */}
      <section className="left relative flex flex-col h-screen min-w-96 w-96 bg-gray-900 border-r border-gray-800 shadow-xl z-20">
        {/* Header */}
        <header className="flex justify-between items-center p-4 w-full bg-gray-900 border-b border-gray-800">
          <button
            className="flex gap-2 items-center text-gray-300 hover:text-white transition-colors duration-200"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-user-add-line mr-1 text-lg"></i>
            <p className="text-sm font-medium">Add collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 text-gray-400 hover:text-white transition-all duration-200"
          >
            <i className="ri-group-line text-xl"></i>
          </button>
        </header>

        {/* Chat Area */}
        <div className="conversation-area flex-grow flex flex-col h-full relative overflow-hidden">
          <div
            ref={messageBox}
            className="message-box p-4 flex-grow flex flex-col gap-4 overflow-auto scrollbar-hide pb-20"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${msg?.sender?._id === "ai" ? "max-w-xs" : "max-w-xs"} ${msg?.sender?._id == user._id.toString() && "ml-auto"} message flex flex-col`}
              >
                <small
                  className={`text-[10px] mb-1 px-1 ${msg?.sender?._id === user._id.toString() ? "text-right text-gray-400" : "text-gray-400"}`}
                >
                  {msg?.sender?.email}
                </small>

                <div
                  className={`p-3 rounded-2xl shadow-sm text-sm ${
                    msg?.sender?._id === "ai"
                      ? "bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700"
                      : msg?.sender?._id === user._id.toString()
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-700 text-gray-200 rounded-tl-none"
                  }`}
                >
                  {msg?.sender?._id === "ai" ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="inputField w-full flex absolute bottom-0 bg-gray-900 border-t border-gray-800 p-3 z-30">
            <div className="relative flex-grow flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500 overflow-hidden">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                className="p-3 pl-4 bg-transparent text-white border-none outline-none flex-grow font-sans text-sm placeholder-gray-500"
                type="text"
                placeholder="Type a message..."
              />
              <button
                onClick={send}
                className="px-4 py-3 bg-transparent text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xl"
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel (Collaborators) */}
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-gray-900 absolute transition-transform duration-300 z-50 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0 border-r border-gray-800 shadow-2xl`}
        >
          <header className="flex justify-between items-center px-4 p-4 border-b border-gray-800 bg-gray-900">
            <h1 className="font-semibold text-sm text-gray-200">
              Collaborators
            </h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2 p-2">
            {project.users &&
              project.users.map(
                (
                  u,
                  idx, // Changed variable name to 'u' to avoid conflict
                ) => (
                  <div
                    key={idx}
                    className="user cursor-pointer hover:bg-gray-800 p-2 rounded-lg flex gap-3 items-center transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-xs border border-white/10">
                      {u.email && u.email.length > 0
                        ? u.email[0].toUpperCase()
                        : "?"}
                    </div>
                    <h1 className="font-medium text-sm text-gray-300">
                      {u.email}
                    </h1>
                  </div>
                ),
              )}
          </div>
        </div>
      </section>

      {/* Right Pane: Editor & Preview */}
      <section className="right flex-grow h-full flex flex-col bg-gray-950">
        {/* Top Header / Explorer + Tabs */}
        <div className="explorer-header flex h-10 border-b border-gray-800 items-center justify-between bg-gray-900">
          <div className="flex items-center h-full">
            {/* Simulated Mac Dots */}
            {/* <div className='flex gap-2 px-4 border-r border-gray-800 h-full items-center'>
                    <div className='w-3 h-3 rounded-full bg-red-500'></div>
                    <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                    <div className='w-3 h-3 rounded-full bg-green-500'></div>
                </div> */}
            <div className="px-4 text-xs font-semibold text-gray-400 tracking-wider">
              EXPLORER
            </div>
          </div>

          <div className="actions flex gap-3 px-4 items-center">
            {/* Only show run button if webcontainer is ready */}
            <button
              onClick={async () => {
                await webContainer.mount(fileTree);
                const installProcess = await webContainer.spawn("npm", [
                  "install",
                ]);
                installProcess.output.pipeTo(
                  new WritableStream({
                    write(chunk) {
                      console.log(chunk);
                    },
                  }),
                );
                if (runProcess) {
                  runProcess.kill();
                }
                let tempRunProcess = await webContainer.spawn("npm", ["start"]);
                tempRunProcess.output.pipeTo(
                  new WritableStream({
                    write(chunk) {
                      console.log(chunk);
                    },
                  }),
                );
                setRunProcess(tempRunProcess);
                webContainer.on("server-ready", (port, url) => {
                  console.log(port, url);
                  setIframeUrl(url);
                });
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors duration-200 shadow-lg shadow-blue-500/20"
            >
              <i className="ri-play-fill text-sm"></i> Run
            </button>
          </div>
        </div>

        <div className="work-area flex flex-grow h-full overflow-hidden">
          {/* File Explorer */}
          <FileExplorer
            fileTree={fileTree}
            setCurrentFile={setCurrentFile}
            setFileTree={setFileTree}
            saveFileTree={saveFileTree}
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            creationMode={creationMode}
            setCreationMode={setCreationMode}
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            handleCreateNewItem={handleCreateNewItem}
            deleteItem={deleteItem}
            selectedDir={selectedDir}
            setSelectedDir={setSelectedDir}
            onDirSelect={setSelectedDir}
          />

          {/* Code Editor Area */}
          <CodeEditor
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            fileTree={fileTree}
            currentFile={currentFile}
            setCurrentFile={setCurrentFile}
            setFileTree={setFileTree}
            saveFileTree={saveFileTree}
            deleteItem={deleteItem}
          />

          {/* Preview Iframe */}
          {iframeUrl && webContainer && (
            <div className="flex min-w-96 w-96 flex-col h-full border-l border-gray-800 bg-white shadow-xl animate-slide-in">
              <div className="address-bar p-2 bg-gray-100 border-b border-gray-200 flex flex-col gap-1">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <input
                  type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl}
                  className="w-full p-1.5 px-3 text-xs bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <iframe
                src={iframeUrl}
                className="w-full flex-grow bg-white border-none"
              ></iframe>
            </div>
          )}
        </div>
      </section>

      {/* Collaborator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-96 max-w-full relative shadow-2xl transform transition-all scale-100">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Select User</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-3 mb-16 max-h-80 overflow-y-auto custom-scrollbar p-1">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user cursor-pointer p-3 rounded-lg flex gap-4 items-center transition-all duration-200 border border-transparent ${Array.from(selectedUserId).indexOf(user._id) != -1 ? "bg-gray-800 border-blue-600" : "hover:bg-gray-800"}`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gray-700 relative overflow-hidden">
                    {/* Placeholder Avatar */}
                    <span className="z-10 font-bold">
                      {user.email[0].toUpperCase()}
                    </span>
                    <i className="ri-user-fill absolute text-4xl opacity-10 translate-y-2"></i>
                  </div>
                  <h1 className="font-medium text-gray-200">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 w-10/12 text-center"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
