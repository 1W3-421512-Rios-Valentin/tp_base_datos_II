import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
        <div className="card border border-gray-100">
          <div className="mb-6">
            <span className="badge-success">Comunidad educativa</span>
          </div>
          <h1 className="title text-2xl mb-2">Crea tu cuenta</h1>
          <p className="text-muted mb-6">Únete para compartir y descubrir material académico.</p>
          
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
              Crear cuenta
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary font-semibold hover:text-green-700">
              Inicia sesión
            </Link>
          </p>
        </div>
        </div>
      </div>
    </Layout>
  );
}