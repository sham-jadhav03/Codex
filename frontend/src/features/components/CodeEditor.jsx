import React from "react";
import hljs from "highlight.js";
import { getLanguageFromFilename } from "../utils/buildTree";

const CodeEditor = (props) => {
  return (
    <div className="code-editor flex flex-col flex-grow h-full relative bg-gray-950">
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
                  props.deleteItem(file);
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
        className="bottom flex flex-grow max-w-full shrink overflow-auto
        relative custom-scrollbar"
      >
        {props.currentFile && props.fileTree[props.currentFile] ? (
          <div
            className="code-editor-area h-full w-full bg-gray-950 font-mono text-sm
            leading-relaxed"
          >
            <pre className="hljs h-full w-full m-0">
              <code
                className="hljs h-full outline-none w-full p-6"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const updatedContent = e.target.innerText;
                  const ft = {
                    ...props.fileTree,
                    [props.currentFile]: {
                      file: { contents: updatedContent },
                    },
                  };
                  props.setFileTree(ft);
                  props.saveFileTree(ft); // explicit ft — fixes TD-01
                }}
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    // ── Language detection — fixes TD-07 ──────────────────────
                    const lang = getLanguageFromFilename(props.currentFile);
                    const contents =
                      props.fileTree[props.currentFile]?.file?.contents ?? "";
                    try {
                      return hljs.highlight(lang, contents).value;
                    } catch {
                      // Fallback: no highlighting, plain text escaped
                      return contents
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");
                    }
                  })(),
                }}
                style={{
                  whiteSpace: "pre-wrap",
                  paddingBottom: "25rem",
                  fontFamily: '"Fira Code", monospace',
                  fontSize: "14px",
                  backgroundColor: "#0a0a0a",
                }}
              />
            </pre>
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
