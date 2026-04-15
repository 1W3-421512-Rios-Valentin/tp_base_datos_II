import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiFolder, FiFile, FiChevronRight, FiChevronDown } from 'react-icons/fi';

export default function TreeView({ resources }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const buildTree = (items, parentId = null) => {
    return items.filter(item => 
      (item.parentId || null) === parentId
    ).map(item => ({
      ...item,
      children: buildTree(items, item._id)
    }));
  };

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children?.length > 0;
    const isExpanded = expanded[node._id];

    return (
      <div key={node._id} style={{ marginLeft: level * 20 }}>
        <div className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg group">
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node._id)}
              className="p-1 hover:bg-gray-100 rounded mr-1"
            >
              {isExpanded ? (
                <FiChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          
          <Link
            href={`/resource/${node._id}`}
            className="flex items-center space-x-2 flex-1"
          >
            {hasChildren ? (
              <FiFolder className="w-4 h-4 text-yellow-500" />
            ) : (
              <FiFile className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-gray-700 hover:text-primary">{node.title}</span>
          </Link>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree(resources);
  
  return (
    <div className="space-y-1">
      {treeData.map(node => renderNode(node))}
    </div>
  );
}