import React, { useState, useMemo } from 'react'
import buildTree from '../utils/buildTree'

const TreeNode = ({ name, node, depth, expandedDirs, toggleExpand, selectedDir, setSelectedDir, ...props }) => {
    const isFolder = node.type === 'directory';
    const isSelected = selectedDir === node.fullPath;
    const isExpanded = expandedDirs.has(node.fullPath);
    
    const childrenKeys = useMemo(() => {
        if (!isFolder) return [];
        return Object.keys(node.children).sort((a, b) => {
            const childA = node.children[a];
            const childB = node.children[b];
            if (childA.type === 'directory' && childB.type !== 'directory') return -1;
            if (childA.type !== 'directory' && childB.type === 'directory') return 1;
            return a.localeCompare(b);
        });
    }, [isFolder, node.children]);

    const handleNodeClick = (e) => {
        e.stopPropagation();
        if (isFolder) {
            toggleExpand(node.fullPath);
            setSelectedDir(node.fullPath);
        } else {
            props.setCurrentFile(node.fullPath);
            props.setOpenFiles([...new Set([...props.openFiles, node.fullPath])]);
            // Set selected directory to the parent folder of this file
            const pathParts = node.fullPath.split('/');
            if (pathParts.length > 1) {
                setSelectedDir(pathParts.slice(0, -1).join('/'));
            } else {
                setSelectedDir(null);
            }
        }
    };

    return (
        <div className="w-full flex flex-col">
            <button
                onClick={handleNodeClick}
                style={{ paddingLeft: `${(depth * 12) + 12}px` }}
                className={`tree-element cursor-pointer py-2 pr-3 flex items-center gap-2 rounded-md w-full text-left transition-all duration-150 group justify-between ${
                    !isFolder && props.currentFile === node.fullPath 
                        ? "bg-gray-800 text-white" 
                        : isSelected 
                            ? "bg-gray-800/60 text-white" 
                            : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
                }`}
            >
                <div className="flex items-center gap-1.5 overflow-hidden flex-grow">
                    {isFolder ? (
                        <>
                            <i className={`ri-arrow-right-s-line text-sm text-gray-500 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}></i>
                            <i className={`ri-folder-${isExpanded ? 'open' : 'line'} text-lg text-yellow-500`}></i>
                        </>
                    ) : (
                        <>
                            <span className="w-3.5"></span> {/* Alignment spacer */}
                            <i className="ri-file-code-line text-lg text-blue-400"></i>
                        </>
                    )}
                    <p className="font-sans text-sm font-medium truncate">
                        {name}
                    </p>
                </div>
                <i
                    onClick={(e) => {
                        e.stopPropagation();
                        props.deleteItem(node.fullPath);
                    }}
                    className="ri-delete-bin-line text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                ></i>
            </button>
            
            {isFolder && isExpanded && (
                <div className="w-full flex flex-col mt-0.5">
                    {/* Render input field nested inside directory if selected and in creationMode */}
                    {props.creationMode && selectedDir === node.fullPath && (
                        <div 
                            style={{ paddingLeft: `${((depth + 1) * 12) + 26}px` }}
                            className="p-2 pr-3 flex items-center gap-2 rounded-md w-full bg-gray-800/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {props.creationMode === 'folder' ? (
                                <i className="ri-folder-line text-yellow-500"></i>
                            ) : (
                                <i className="ri-file-code-line text-blue-400"></i>
                            )}
                            <input
                                autoFocus
                                value={props.newItemName}
                                onChange={(e) => props.setNewItemName(e.target.value)}
                                onBlur={() => props.setCreationMode(null)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') props.handleCreateNewItem();
                                    if (e.key === 'Escape') props.setCreationMode(null);
                                }}
                                className="bg-transparent text-sm text-white font-sans outline-none w-full"
                            />
                        </div>
                    )}
                    
                    {childrenKeys.map((childName) => (
                        <TreeNode
                            key={childName}
                            name={childName}
                            node={node.children[childName]}
                            depth={depth + 1}
                            expandedDirs={expandedDirs}
                            toggleExpand={toggleExpand}
                            selectedDir={selectedDir}
                            setSelectedDir={setSelectedDir}
                            {...props}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer = (props) => {
    const { fileTree, selectedDir, setSelectedDir } = props;
    const [expandedDirs, setExpandedDirs] = useState(new Set());

    const toggleExpand = (path) => {
        setExpandedDirs((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const tree = useMemo(() => buildTree(fileTree), [fileTree]);

    const rootKeys = useMemo(() => {
        return Object.keys(tree).sort((a, b) => {
            const nodeA = tree[a];
            const nodeB = tree[b];
            if (nodeA.type === 'directory' && nodeB.type !== 'directory') return -1;
            if (nodeA.type !== 'directory' && nodeB.type === 'directory') return 1;
            return a.localeCompare(b);
        });
    }, [tree]);

    return (
        <div className="explorer h-full w-64 border-r border-gray-800 bg-gray-900 flex flex-col select-none">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <span className="text-xs font-semibold text-gray-400">FILES</span>
                <div className="flex gap-2 text-gray-400">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            props.setCreationMode('file');
                        }} 
                        className="hover:text-white transition-colors"
                        title="New File"
                    >
                        <i className="ri-file-add-line"></i>
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            props.setCreationMode('folder');
                        }} 
                        className="hover:text-white transition-colors"
                        title="New Folder"
                    >
                        <i className="ri-folder-add-line"></i>
                    </button>
                </div>
            </div>
            
            <div 
                className="file-tree w-full p-2 space-y-1 overflow-auto flex-grow"
                onClick={() => setSelectedDir(null)}
            >
                {/* Render root-level input field when creationMode is active and selectedDir is null */}
                {props.creationMode && selectedDir === null && (
                    <div className="p-2 px-3 flex items-center gap-2 rounded-md w-full bg-gray-800">
                        {props.creationMode === 'folder' ? (
                            <i className="ri-folder-line text-yellow-500"></i>
                        ) : (
                            <i className="ri-file-code-line text-blue-400"></i>
                        )}
                        <input
                            autoFocus
                            value={props.newItemName}
                            onChange={(e) => props.setNewItemName(e.target.value)}
                            onBlur={() => props.setCreationMode(null)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') props.handleCreateNewItem();
                                if (e.key === 'Escape') props.setCreationMode(null);
                            }}
                            className="bg-transparent text-sm text-white font-sans outline-none w-full"
                        />
                    </div>
                )}
                
                {rootKeys.map((name) => (
                    <TreeNode
                        key={name}
                        name={name}
                        node={tree[name]}
                        depth={0}
                        expandedDirs={expandedDirs}
                        toggleExpand={toggleExpand}
                        selectedDir={selectedDir}
                        setSelectedDir={setSelectedDir}
                        {...props}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileExplorer