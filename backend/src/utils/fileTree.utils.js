/**
 * @description: All backend logic for validating, sanitising, and traversing the file tree
 * nested file tree structure before before they touch MongoDB.
 */

// -- contants -- //

const MAX_FILE_SIZE_BYTES = 512 * 1024; //  512KB hard limit for project
const MAX_DEPTH = 10; // src/a/b/c/d/e/f/g.js = 8 levels
const MAX_FILES = 200; // per project
const MAX_FILENAME_LENGTH = 128;

// Characters that are dangerous in file paths on Linux / WebContainer
const DANGEROUS_PATH_RE = /\.\.|[<>:"|?*\x00-\x1f]/;

// ─── Path Sanitisation ─── //
/**
 *  @description: Validates a single file path key,
 *  returns {valid: true} or {valid: false, reason: string}
 */

export const validateFilePath = (pathKey) => {
  if (typeof pathKey !== "string" || pathKey.trim() === "") {
    return { valid: false, reason: `Path must be a non-empty string` };
  }

  if (pathKey.length > MAX_FILENAME_LENGTH * MAX_DEPTH) {
    return { valid: false, reason: `Path too long: ${pathKey}` };
  }

  // Reject path traversal and illegal characters
  if (DANGEROUS_PATH_RE.test(pathKey)) {
    return { valid: false, reason: `Illegal character in path: ${pathKey}` };
  }

  //reject absolute paths
  if (pathKey.startsWith("/")) {
    return { valid: false, reason: `Absolute path not allowed: ${pathKey}` };
  }

  // Validate each segment individually
  const segments = pathKey.split("/");

  if (segments.length > MAX_DEPTH) {
    return {
      valid: false,
      reason: `Path exceeds max depth of ${MAX_DEPTH}: ${pathKey}`,
    };
  }

  for (const segment of segments) {
    if (segment === "" || segment === "." || segment === "..") {
      return { valid: false, reason: `Invalid path segment in: ${pathKey}` };
    }
    if (segment.length > MAX_FILENAME_LENGTH) {
      return { valid: false, reason: `Segment too long in: ${pathKey}` };
    }
  }

  return { valid: true };
};

/**
 * @description Validates the entire flat fileTree object received from the client.
 * Returns { valid: true, fileCount } or { valid: false, reason }
 *
 * Expects WebContainer flat format:
 *   { "src/App.jsx": { file: { contents: "..." } } }
 *   { "src":         { directory: {} } }
 */
export const validateFileTree = (fileTree) => {
  if (!fileTree || typeof fileTree !== "object" || Array.isArray(fileTree)) {
    return { valid: false, reason: "fileTree must be a plain object" };
  }

  // Size check — serialize once, reject if too large
  let serialized;
  try {
    serialized = JSON.stringify(fileTree);
  } catch {
    return { valid: false, reason: "fileTree is not serialisable" };
  }

  if (Buffer.byteLength(serialized, "utf8") > MAX_FILE_TREE_SIZE_BYTES) {
    return {
      valid: false,
      reason: `fileTree exceeds ${MAX_FILE_TREE_SIZE_BYTES / 1024}KB limit`,
    };
  }

  const keys = Object.keys(fileTree);

  if (keys.length > MAX_FILES) {
    return { valid: false, reason: `fileTree exceeds ${MAX_FILES} file limit` };
  }

  for (const key of keys) {
    // Validate the path key itself
    const pathResult = validatePath(key);
    if (!pathResult.valid) return pathResult;

    const node = fileTree[key];

    if (!node || typeof node !== "object") {
      return { valid: false, reason: `Invalid node at path: ${key}` };
    }

    // Node must be either { file: { contents: string } } or { directory: {} }
    const isFile = "file" in node;
    const isDirectory = "directory" in node;

    if (!isFile && !isDirectory) {
      return {
        valid: false,
        reason: `Node at "${key}" must have "file" or "directory" key`,
      };
    }

    if (isFile) {
      if (!node.file || typeof node.file.contents !== "string") {
        return {
          valid: false,
          reason: `node.file.contents must be a string at: ${key}`,
        };
      }
    }

    if (isDirectory) {
      // directory value must be an object (can be empty {})
      if (typeof node.directory !== "object" || Array.isArray(node.directory)) {
        return {
          valid: false,
          reason: `node.directory must be an object at: ${key}`,
        };
      }
    }
  }

  return { valid: true, fileCount: keys.length };
};

/**
 * @description Recursively collects all file path keys from the flat fileTree.
 * Useful for analytics, search, or future indexing.
 *
 * Returns string[] of all file paths (excludes directory-only entries).
 */
export function collectFilePaths(fileTree) {
  return Object.entries(fileTree)
    .filter(([, node]) => "file" in node)
    .map(([key]) => key);
}

/**
 * @description Recursively builds a nested tree from the flat fileTree.
 * Used server-side if you ever need to walk the tree
 * (e.g. for AI context injection, search, or code review).
 *
 * Returns a nested object — never persisted, only used in-memory.
 */
export function buildNestedTree(fileTree) {
  const root = {};
 
  for (const [flatPath, node] of Object.entries(fileTree)) {
    const segments = flatPath.split("/");
    let cursor     = root;
 
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (!cursor[seg]) {
        cursor[seg] = { type: "directory", children: {} };
      }
      cursor = cursor[seg].children;
    }
 
    const filename = segments[segments.length - 1];
 
    if ("file" in node) {
      cursor[filename] = {
        type:     "file",
        fullPath: flatPath,
        contents: node.file.contents,
      };
    } else {
      cursor[filename] = cursor[filename] || {
        type:     "directory",
        children: {},
      };
    }
  }
 
  return root;
}
 
/**
 * @description Recursively extracts all file contents as a flat array.
 * Used for AI context: pass all files as prompt context.
 *
 * Returns [{ path, contents }]
 */
export function extractAllContents(fileTree) {
  return collectFilePaths(fileTree).map((path) => ({
    path,
    contents: fileTree[path].file.contents,
  }));
}
