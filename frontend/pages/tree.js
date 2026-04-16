import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { FiFolder, FiFile, FiHeart, FiArrowRight, FiLock } from 'react-icons/fi';

const ProtectedLanding = () => {
  return (
    <Layout>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="relative min-h-screen -mx-4 -my-8 bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden flex items-center">
        <div className="max-w-4xl mx-auto px-4 py-20 w-full text-center">
          <div className="space-y-8">
            <div className="fade-in-up" style={{ animationDelay: '0s' }}>
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-lg">
                <FiLock className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="title text-5xl mb-4">Tu árbol de estudio</h1>
              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-semibold">
                Es exclusivo para ti
              </p>
            </div>

            <div className="fade-in-up max-w-2xl mx-auto" style={{ animationDelay: '0.4s' }}>
              <p className="text-lg text-muted leading-relaxed">
                Accede a tu árbol de estudio personal donde guardas tus archivos favoritos organizados por categoría.
              </p>
            </div>

            <div className="fade-in-up grid grid-cols-1 md:grid-cols-3 gap-6 mt-12" style={{ animationDelay: '0.6s' }}>
              <div className="card border border-green-100">
                <FiHeart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Guarda favoritos</h3>
                <p className="text-sm text-gray-600">Dale corazón a los archivos que más te sirven</p>
              </div>
              <div className="card border border-green-100">
                <FiFolder className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Organiza por tema</h3>
                <p className="text-sm text-gray-600">Agrupa materiales por categoría automáticamente</p>
              </div>
              <div className="card border border-green-100">
                <FiFile className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Acceso rápido</h3>
                <p className="text-sm text-gray-600">Encuentra tus apuntes favoritos al instante</p>
              </div>
            </div>

            <div className="fade-in-up pt-8" style={{ animationDelay: '0.8s' }}>
              <p className="text-muted mb-6">Para usar esta función necesitas iniciar sesión</p>
              <Link
                href="/login"
                className="button-primary inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all shadow-md"
              >
                Inicia sesión para continuar
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="text-primary font-semibold hover:text-green-700">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const TreeContent = () => {
  const [tree, setTree] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTree();
  }, [category]);

  const fetchTree = async () => {
    try {
      const res = await api.get('/resources/liked');
      setTree(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTree = category ? tree.filter((item) => item.category === category) : tree;

  const groupedByCategory = filteredTree.reduce((acc, item) => {
    const cat = item.category || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedByCategory);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi árbol de estudio</h1>

        {categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : tree.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FiHeart className="w-12 h-12 mx-auto text-gray-300" />
          <p className="text-gray-500 mt-3">Tu árbol está vacío.</p>
          <p className="text-sm text-gray-400 mt-1">Dale ❤️ a los archivos que te gusten para agregarlos aquí.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2 mt-4 text-primary hover:bg-indigo-50 rounded-lg transition-all font-medium"
          >
            Explorar archivos
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center space-x-2">
                <FiFolder className="text-yellow-500" />
                <span className="font-medium text-gray-900">{cat}</span>
                <span className="text-sm text-gray-400">({groupedByCategory[cat].length})</span>
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
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default function Tree() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return user ? <TreeContent /> : <ProtectedLanding />;
}
