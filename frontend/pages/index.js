import { useState, useEffect } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';
import ResourceCard from '../components/ResourceCard';

const CATEGORIES = ['Todos', 'Matemática', 'Física', 'Química', 'Biología', 'Programación', 'Economía', 'Otros'];

export default function Home() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [category]);

  const fetchResources = async () => {
    try {
      const params = category !== 'Todos' ? { category } : {};
      const res = await api.get('/resources', { params });
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchResources();
      return;
    }
    try {
      const res = await api.get('/resources', { params: { search } });
      setResources(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Buscar apuntes, ejercicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay recursos todavía.</p>
            <p className="text-sm text-gray-400 mt-1">¡Sé el primero en subir material!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}