/**
 * buildTree.js
 * Pure utility — converts flat WebContainer fileTree format
 * into a nested display tree. Never mutates input. Never persisted.
 *
 * Input (flat — what MongoDB stores, what WebContainer expects):
 *   {
 *     "package.json":      { file: { contents: "..." } },
 *     "src/App.jsx":       { file: { contents: "..." } },
 *     "src/index.css":     { file: { contents: "..." } },
 *     "src/components":    { directory: {} },
 *   }
 *
 * Output (nested — what FileExplorer renders):
 *   {
 *     "package.json": { type: "file", fullPath: "package.json" },
 *     "src": {
 *       type: "directory",
 *       fullPath: "src",
 *       children: {
 *         "App.jsx":    { type: "file", fullPath: "src/App.jsx" },
 *         "index.css":  { type: "file", fullPath: "src/index.css" },
 *         "components": { type: "directory", fullPath: "src/components", children: {} }
 *       }
 *     }
 *   }
 */

/**
 * @param {Object} flatFileTree - raw fileTree from MongoDB / AI response
 * @returns {Object} nested display tree
 */
export function buildTree(flatFileTree) {
  // Guard — always return a safe object
  if (!flatFileTree || typeof flatFileTree !== "object") return {};

  const root = {};

  // Sort keys so directories are processed before their children.
  // "src" before "src/App.jsx" ensures parent node exists before child insert.
  const sortedKeys = Object.keys(flatFileTree).sort();

  for (const flatPath of sortedKeys) {
    const node = flatFileTree[flatPath];
    const segments = flatPath.split("/").filter(Boolean); // filter removes empty strings from leading slash

    if (segments.length === 0) continue; // skip malformed keys

    let cursor = root;

    // Walk every segment except the last — these are directory levels
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];

      // If this intermediate directory doesn't exist yet, create it
      if (!cursor[seg]) {
        cursor[seg] = {
          type: "directory",
          fullPath: segments.slice(0, i + 1).join("/"),
          children: {},
        };
      }

      // If a file key somehow collides with a directory segment, skip safely
      if (cursor[seg].type !== "directory") break;

      cursor = cursor[seg].children;
    }

    const lastName = segments[segments.length - 1];
    const isDir = "directory" in node;

    if (isDir) {
      // Explicit directory node — merge children if already created implicitly
      if (cursor[lastName] && cursor[lastName].type === "directory") {
        // Already created implicitly — just ensure fullPath is set
        cursor[lastName].fullPath = flatPath;
      } else {
        cursor[lastName] = {
          type: "directory",
          fullPath: flatPath,
          children: cursor[lastName]?.children || {},
        };
      }
    } else {
      // File node
      cursor[lastName] = {
        type: "file",
        fullPath: flatPath,
      };
    }
  }

  return root;
}

/**
 * Sorts tree entries: directories first, then files, both alphabetically.
 * @param {Object} treeNode - children object from a directory node
 * @returns {Array<[string, Object]>} sorted [name, node] pairs
 */
export function sortedEntries(treeNode) {
  return Object.entries(treeNode).sort(([aName, aNode], [bName, bNode]) => {
    const aIsDir = aNode.type === "directory";
    const bIsDir = bNode.type === "directory";
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1; // dirs first
    return aName.localeCompare(bName); // alpha within group
  });
}

/**
 * Returns the file extension language hint for CodeEditor.
 * Kept here so it travels with the file tree utilities.
 * @param {string} filename
 * @returns {string} hljs language string
 */
export function getLanguageFromFilename(filename) {
  if (!filename) return "plaintext";
  const ext = filename.split(".").pop().toLowerCase();
  const map = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    css: "css",
    scss: "scss",
    html: "xml",
    xml: "xml",
    json: "json",
    md: "markdown",
    py: "python",
    sh: "bash",
    yml: "yaml",
    yaml: "yaml",
    env: "plaintext",
  };
  return map[ext] || "plaintext";
}
