import React from "react";
import hljs from "highlight.js";

const CodeEditor = (props) => {
  return (
    <>
      <div className="code-editor flex flex-col flex-grow h-full relative bg-gray-950">
        {/* Tabs */}
        <div className="top flex overflow-x-auto bg-gray-900 border-b border-gray-800 scrollbar-hide h-10">
          {props.openFiles.map((file, index) => (
            <button
              key={index}
              onClick={() => props.setCurrentFile(file)}
              className={`open-file cursor-pointer px-4 flex items-center min-w-fit gap-2 border-r border-gray-800 transition-colors duration-150 relative group 
                ${props.currentFile === file ? "bg-gray-800 text-white border-t-2 border-t-blue-500" : "bg-gray-900 text-gray-500 hover:bg-gray-800"}`}
            >
              <p className="font-sans text-sm font-medium">{file}</p>
              <i onClick={(e) => {
                e.stopPropagation();
                props.deleteItem(file);
              }}
                className="ri-close-fill pl-0"></i>
            </button>
          ))}
        </div>

        <div className="bottom flex flex-grow max-w-full shrink overflow-auto relative custom-scrollbar">
          {props.fileTree[props.currentFile] && (
            <div className="code-editor-area h-full w-full bg-gray-950 font-mono text-sm leading-relaxed">
              <pre className="hljs h-full w-full m-0">
                <code
                  className="hljs h-full outline-none w-full p-6" // Added padding for aesthetics
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedContent = e.target.innerText;
                    const ft = {
                      ...props.fileTree,
                      [props.currentFile]: {
                        file: {
                          contents: updatedContent,
                        },
                      },
                    };
                    props.setFileTree(ft);
                    props.saveFileTree(ft);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      "javascript",
                      props.fileTree[props.currentFile].file.contents,
                    ).value,
                  }}
                  style={{
                    whiteSpace: "pre-wrap",
                    paddingBottom: "25rem",
                    counterSet: "line-numbering",
                    fontFamily: '"Fira Code", monospace',
                    fontSize: "14px",
                    backgroundColor: "#0a0a0a", // Match Atom One Dark bg somewhat or transparent
                  }}
                />
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CodeEditor;
