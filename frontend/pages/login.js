import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
        <div className="card border border-gray-100">
          <div className="mb-6">
            <span className="badge-success">Acceso seguro</span>
          </div>
          <h1 className="title text-2xl mb-2">Bienvenido de vuelta</h1>
          <p className="text-muted mb-6">Inicia sesión para continuar con tu comunidad de estudio.</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              className="button-primary w-full py-4 font-medium"
            >
              Iniciar sesión
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary font-semibold hover:text-green-700">
              Regístrate
            </Link>
          </p>
        </div>
        </div>
      </div>
    </Layout>
  );
}