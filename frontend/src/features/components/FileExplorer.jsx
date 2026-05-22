import React, { useState, useCallback } from "react";
import { buildTree, sortedEntries } from "../utils/buildTree";

// ─── TreeNode ─────────────────────────────────────────────────────────────────
// Recursive component. Renders one node (file or directory) and its children.

const TreeNode = ({
  name,
  node,
  depth,
  currentFile,
  openFiles,
  setCurrentFile,
  setOpenFiles,
  deleteItem,
  expandedDirs,
  toggleDir,
  onDirSelect,
  selectedDir,
}) => {
  const isDir = node.type === "directory";
  const isExpanded = isDir && expandedDirs.has(node.fullPath);
  const isActive = !isDir && currentFile === node.fullPath;

  // Indent: 12px per depth level. Matches VS Code's explorer feel.
  const indent = depth * 12;

  const handleFileClick = useCallback(() => {
    if (isDir) {
      toggleDir(node.fullPath);
      onDirSelect(node.fullPath); // tell Project.jsx which dir is "selected"
      return;
    }
    setCurrentFile(node.fullPath);
    setOpenFiles((prev) => [...new Set([...prev, node.fullPath])]);
  }, [
    isDir,
    node.fullPath,
    toggleDir,
    onDirSelect,
    setCurrentFile,
    setOpenFiles,
  ]);

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      deleteItem(node.fullPath);
    },
    [deleteItem, node.fullPath],
  );

  return (
    <>
      {/* Row */}
      <button
        onClick={handleFileClick}
        title={node.fullPath}
        className={`
          group w-full flex items-center gap-1.5 rounded-md py-[3px] pr-2 text-left
          transition-colors duration-100 relative
          ${
            isActive
              ? "bg-gray-700/80 text-white"
              : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
          }
          ${isDir && selectedDir === node.fullPath ? "text-gray-200" : ""}
        `}
        style={{ paddingLeft: `${8 + indent}px` }}
      >
        {/* Directory chevron */}
        {isDir && (
          <span
            className="text-gray-500 w-3 flex-shrink-0 transition-transform duration-150"
            style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <path d="M2 1l4 3-4 3V1z" />
            </svg>
          </span>
        )}

        {/* File/folder icon */}
        {isDir ? (
          <i
            className={`ri-folder${isExpanded ? "-open" : ""}-line text-sm flex-shrink-0
            ${isExpanded ? "text-yellow-400" : "text-yellow-500/70"}`}
          />
        ) : (
          <FileIcon filename={name} />
        )}

        {/* Name — truncated */}
        <span className="text-xs font-medium font-sans truncate flex-1 min-w-0">
          {name}
        </span>

        {/* Delete button — shown on hover */}
        <i
          onClick={handleDelete}
          className="ri-delete-bin-line text-xs text-gray-600
            hover:text-red-400 opacity-0 group-hover:opacity-100
            transition-opacity duration-150 flex-shrink-0 ml-auto"
        />
      </button>

      {/* Children — only rendered when expanded */}
      {isDir && isExpanded && node.children && (
        <div>
          {sortedEntries(node.children).map(([childName, childNode]) => (
            <TreeNode
              key={childNode.fullPath}
              name={childName}
              node={childNode}
              depth={depth + 1}
              currentFile={currentFile}
              openFiles={openFiles}
              setCurrentFile={setCurrentFile}
              setOpenFiles={setOpenFiles}
              deleteItem={deleteItem}
              expandedDirs={expandedDirs}
              toggleDir={toggleDir}
              onDirSelect={onDirSelect}
              selectedDir={selectedDir}
            />
          ))}
          {/* Empty directory label */}
          {Object.keys(node.children).length === 0 && (
            <p
              className="text-[10px] text-gray-600 italic py-0.5"
              style={{ paddingLeft: `${8 + (depth + 1) * 12}px` }}
            >
              empty
            </p>
          )}
        </div>
      )}
    </>
  );
};

// ─── FileIcon ─────────────────────────────────────────────────────────────────
// Maps file extension to a coloured Remix Icon. Purely cosmetic.

const FileIcon = ({ filename }) => {
  const ext = filename?.split(".").pop()?.toLowerCase();
  const iconMap = {
    js: ["ri-javascript-line", "text-yellow-400"],
    jsx: ["ri-reactjs-line", "text-cyan-400"],
    ts: ["ri-code-s-slash-line", "text-blue-400"],
    tsx: ["ri-reactjs-line", "text-blue-400"],
    css: ["ri-css3-line", "text-blue-300"],
    scss: ["ri-css3-line", "text-pink-400"],
    html: ["ri-html5-line", "text-orange-400"],
    json: ["ri-braces-line", "text-yellow-300"],
    md: ["ri-markdown-line", "text-gray-300"],
    env: ["ri-settings-3-line", "text-green-400"],
    py: ["ri-code-line", "text-blue-300"],
  };
  const [icon, color] = iconMap[ext] || ["ri-file-code-line", "text-gray-400"];
  return <i className={`${icon} text-sm flex-shrink-0 ${color}`} />;
};

// ─── FileExplorer ─────────────────────────────────────────────────────────────

const FileExplorer = (props) => {
  const {
    fileTree,
    currentFile,
    openFiles,
    setCurrentFile,
    setOpenFiles,
    deleteItem,
    creationMode,
    setCreationMode,
    newItemName,
    setNewItemName,
    handleCreateNewItem,
    // New prop: callback so Project.jsx knows which dir is selected
    // for path-prefixed file creation. Add `onDirSelect` to Project.jsx props.
    onDirSelect,
  } = props;

  // ── Local state ─────────────────────────────────────────────────────────────
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [selectedDir, setSelectedDir] = useState("");

  const toggleDir = useCallback((fullPath) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      next.has(fullPath) ? next.delete(fullPath) : next.add(fullPath);
      return next;
    });
  }, []);

  const handleDirSelect = useCallback(
    (fullPath) => {
      setSelectedDir(fullPath);
      onDirSelect?.(fullPath); // optional — Project.jsx uses this for file creation path
    },
    [onDirSelect],
  );

  // ── Build nested tree from flat fileTree ────────────────────────────────────
  // buildTree is pure and cheap for typical project sizes (<200 files).
  // No useMemo needed — fileTree reference changes trigger re-render anyway.
  const nestedTree = buildTree(fileTree);

  // ── New item input handler ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCreateNewItem();
    if (e.key === "Escape") {
      setCreationMode(null);
      setNewItemName("");
    }
  };

  return (
    <div className="explorer h-full w-64 border-r border-gray-800 bg-gray-900 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
          Files
        </span>
        <div className="flex gap-2 text-gray-500">
          <button
            onClick={() => setCreationMode("file")}
            title="New file"
            className="hover:text-white transition-colors duration-150"
          >
            <i className="ri-file-add-line text-sm" />
          </button>
          <button
            onClick={() => setCreationMode("folder")}
            title="New folder"
            className="hover:text-white transition-colors duration-150"
          >
            <i className="ri-folder-add-line text-sm" />
          </button>
        </div>
      </div>

      {/* Tree area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 custom-scrollbar">
        {/* New item input — shown when creationMode is set */}
        {creationMode && (
          <div className="flex items-center gap-2 px-3 py-1 mx-1 rounded-md bg-gray-800/80 border border-gray-700">
            {creationMode === "folder" ? (
              <i className="ri-folder-line text-sm text-yellow-500 flex-shrink-0" />
            ) : (
              <i className="ri-file-code-line text-sm text-blue-400 flex-shrink-0" />
            )}
            <input
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={() => {
                // Small delay so Enter key fires handleCreateNewItem first
                setTimeout(() => setCreationMode(null), 150);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                creationMode === "folder" ? "folder-name" : "file.js"
              }
              className="bg-transparent text-xs text-white font-mono outline-none w-full
                placeholder-gray-600"
            />
          </div>
        )}

        {/* Empty state */}
        {Object.keys(nestedTree).length === 0 && !creationMode && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <i className="ri-folder-open-line text-2xl text-gray-700" />
            <p className="text-[11px] text-gray-600">
              No files yet. Ask @ai to generate.
            </p>
          </div>
        )}

        {/* Recursive tree */}
        {sortedEntries(nestedTree).map(([name, node]) => (
          <TreeNode
            key={node.fullPath}
            name={name}
            node={node}
            depth={0}
            currentFile={currentFile}
            openFiles={openFiles}
            setCurrentFile={setCurrentFile}
            setOpenFiles={setOpenFiles}
            deleteItem={deleteItem}
            expandedDirs={expandedDirs}
            toggleDir={toggleDir}
            onDirSelect={handleDirSelect}
            selectedDir={selectedDir}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
