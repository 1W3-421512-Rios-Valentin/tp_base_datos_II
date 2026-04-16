import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ExamAISimulator from '../components/ExamAISimulator';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AIPage() {
  const [resources, setResources] = useState([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchResources = async () => {
      try {
        const res = await api.get('/resources', { params: { limit: 200 } });
        setResources(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResources();
  }, [loading, user, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto card text-center py-12 border border-gray-100">
          <p className="text-muted">Debes iniciar sesión para usar la recomendación IA.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-secondary">Recomendación IA</h1>
        <p className="text-sm text-muted">Elegí tu examen y obtené recomendaciones de apuntes.</p>
        <ExamAISimulator initialResources={resources} />
      </div>
    </Layout>
  );
}
