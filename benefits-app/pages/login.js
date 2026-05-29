import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [user, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form.username, form.password);
      router.push('/');
    } catch (err) {
      if (!err.response) {
        setError('No se pudo conectar al servidor. Verifica que el backend este corriendo.');
      } else {
        setError(err.response?.data?.message || 'Credenciales incorrectas');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-secondary flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-secondary border-r border-white/10">
        <div className="flex items-center">
          <img
            src="/images/study-benefits-logo.png"
            alt="StudyBenefits"
            className="h-16 w-auto"
            style={{ mixBlendMode: 'screen' }}
          />
        </div>

        <div>
          <h1 className="text-5xl font-black text-surface leading-tight mb-4">
            Tus SanTokens,<br />
            <span className="text-primary">tus beneficios.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            Gana tokens haciendo matches de estudio y canjealo por descuentos reales en cafes, librerias y mas.
          </p>
        </div>

        <p className="text-white/20 text-sm">
          Usa las mismas credenciales de StudyTree &mdash; no necesitas registrarte.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <img
            src="/images/study-benefits-logo.png"
            alt="StudyBenefits"
            className="h-20 w-auto mx-auto"
          />
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-text-main mb-1">Bienvenido</h2>
          <p className="text-gray-400 text-sm mb-8">Ingresa con tu cuenta de StudyTree</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Usuario</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  autoComplete="username"
                  placeholder="tu usuario"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Contrasena</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Ingresando...' : (
                <>Ingresar <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
