import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { getLanguageFromFilename } from "../utils/buildTree";
import { sendMessage } from "../config/socket";

const CodeEditor = (props) => {
  const debounceTimer = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorChange = (val) => {
    const ft = {
      ...props.fileTree,
      [props.currentFile]: {
        file: { contents: val ?? "" },
      },
    };
    props.setFileTree(ft);

    // Debounce database saves by 1 second to avoid database and network overhead
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      props.saveFileTree(ft);
    }, 1000);
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Broadcast cursor movements over socket to other users
  useEffect(() => {
    if (!editorRef.current || !props.currentFile) return;

    const editor = editorRef.current;

    const cursorListener = editor.onDidChangeCursorPosition((e) => {
      sendMessage("cursor-move", {
        file: props.currentFile,
        position: e.position,
      });
    });

    return () => {
      cursorListener.dispose();
    };
  }, [props.currentFile]);

  // Sync cursor decorations inside Monaco Editor
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !props.currentFile) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = [];

    if (props.peerCursors) {
      Object.entries(props.peerCursors).forEach(([userId, peer]) => {
        // Render decoration only if peer is editing the same file
        if (peer.file !== props.currentFile || !peer.position) return;

        newDecorations.push({
          range: new monaco.Range(
            peer.position.lineNumber,
            peer.position.column,
            peer.position.lineNumber,
            peer.position.column
          ),
          options: {
            className: "peer-cursor",
            hoverMessage: { value: `${peer.email} is editing here` },
          },
        });
      });
    }

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [props.peerCursors, props.currentFile]);

  return (
    <div className="code-editor flex flex-col flex-grow h-full relative bg-[#0a0a0a]">
      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div
        className="top flex overflow-x-auto bg-gray-900 border-b border-gray-800
        scrollbar-hide h-10 flex-shrink-0"
      >
        {props.openFiles.map((file, index) => {
          // Show only the filename in the tab, not the full path
          const tabLabel = file.split("/").pop();
          const isActive = props.currentFile === file;

          return (
            <button
              key={index}
              onClick={() => props.setCurrentFile(file)}
              title={file} // full path on hover
              className={`
                open-file cursor-pointer px-4 flex items-center min-w-fit gap-2
                border-r border-gray-800 transition-colors duration-150 relative group
                flex-shrink-0
                ${
                  isActive
                    ? "bg-gray-800 text-white border-t-2 border-t-blue-500"
                    : "bg-gray-900 text-gray-500 hover:bg-gray-800"
                }
              `}
            >
              <p className="font-sans text-sm font-medium">{tabLabel}</p>
              <i
                onClick={(e) => {
                  e.stopPropagation();
                  props.closeFile(file);
                }}
                className="ri-close-fill text-gray-500 hover:text-white
                  transition-colors duration-150"
              />
            </button>
          );
        })}
      </div>

      {/* ── Editor area ─────────────────────────────────────────────────────── */}
      <div
        className="bottom flex flex-grow max-w-full shrink overflow-hidden
        relative bg-[#0a0a0a]"
      >
        {props.currentFile && props.fileTree[props.currentFile] ? (
          <div className="code-editor-area h-full w-full bg-[#0a0a0a]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={getLanguageFromFilename(props.currentFile)}
              value={props.fileTree[props.currentFile]?.file?.contents ?? ""}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: '"Fira Code", "Courier New", monospace',
                minimap: { enabled: false },
                automaticLayout: true,
                cursorBlinking: "smooth",
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                },
                padding: { top: 16 },
                tabSize: 2,
              }}
            />
          </div>
        ) : (
          /* ── Empty state ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center h-full w-full gap-3">
            <i className="ri-code-s-slash-line text-4xl text-gray-700" />
            <p className="text-sm text-gray-600 font-sans">
              Select a file to start editing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
