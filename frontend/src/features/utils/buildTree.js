const buildTree = (flatFileTree) => {
  const root = {};

  if (!flatFileTree) return root;

  Object.keys(flatFileTree).forEach((path) => {
    const segments = path.split('/');
    let current = root;
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      const isLast = i === segments.length - 1;

      if (!current[segment]) {
        if (isLast) {
          const nodeData = flatFileTree[path];
          if (nodeData && nodeData.directory) {
            current[segment] = {
              type: 'directory',
              fullPath: path,
              children: {},
            };
          } else {
            current[segment] = {
              type: 'file',
              fullPath: path,
            };
          }
        } else {
          current[segment] = {
            type: 'directory',
            fullPath: currentPath,
            children: {},
          };
        }
      } else {
        // If node already exists and this is the last segment and it represents an explicit directory,
        // make sure it has the correct properties.
        if (isLast && flatFileTree[path] && flatFileTree[path].directory) {
          current[segment].type = 'directory';
          current[segment].fullPath = path;
        }
      }

      if (current[segment].type === 'directory') {
        current = current[segment].children;
      }
    }
  });

  return root;
};

export default buildTree;
