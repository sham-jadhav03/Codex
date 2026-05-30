import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { getLanguageFromFilename } from "../utils/buildTree";

const CodeEditor = (props) => {
  const debounceTimer = useRef(null);

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
