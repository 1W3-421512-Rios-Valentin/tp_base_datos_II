import { useState, useEffect } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';
import { FiFolder, FiFile, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';

export default function Tree() {
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchTree();
  }, [category]);

  const fetchTree = async () => {
    try {
      const params = category ? { category } : {};
      const res = await api.get('/resources/tree', { params });
      setTree(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFolder = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const groupedByCategory = tree.reduce((acc, item) => {
    const cat = item.category || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedByCategory);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Árbol de estudio</h1>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FiFolder className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-gray-500 mt-3">No hay material en el árbol todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center space-x-2">
                <FiFolder className="text-yellow-500" />
                <span className="font-medium text-gray-900">{cat}</span>
                <span className="text-sm text-gray-400">
                  ({groupedByCategory[cat].length})
                </span>
              </div>
              
              <div className="divide-y divide-gray-50">
                {groupedByCategory[cat].map((item) => (
                  <Link
                    key={item._id}
                    href={`/resource/${item._id}`}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <FiFile className="text-blue-500" />
                    <span className="text-gray-700">{item.title}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}