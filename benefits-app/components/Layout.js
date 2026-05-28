import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiTag, FiCreditCard, FiLogOut, FiLogIn } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!user) { setBalance(null); return; }
    api.get('/wallet/balance')
      .then(res => setBalance(res.data.balance))
      .catch(() => {});
  }, [user, router.pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/', icon: FiMapPin, label: 'Lugares' },
    { href: '/benefits', icon: FiTag, label: 'Descuentos' },
    { href: '/wallet', icon: FiCreditCard, label: 'Mi Wallet' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow">
                <span className="text-white text-lg">🎁</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg leading-none block">StudyBenefits</span>
                <span className="text-xs text-gray-400 leading-none">powered by SanTokens</span>
              </div>
            </Link>

            {/* Nav + balance */}
            <div className="flex items-center gap-1">
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${router.pathname === href
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              ))}

              {user ? (
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">
                  {balance !== null && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                      <img src="/images/santoken.png.webp" alt="SanToken" className="w-5 h-5 rounded-full object-cover border border-yellow-300" />
                      <span className="font-bold text-amber-700 text-sm">{balance}</span>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="ml-2 flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          StudyBenefits — Canjea tus SanTokens por recompensas reales 🎁
        </div>
      </footer>
    </div>
  );
}
