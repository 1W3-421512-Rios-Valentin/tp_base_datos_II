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
    { href: '/',         icon: FiMapPin,     label: 'Lugares'    },
    { href: '/benefits', icon: FiTag,        label: 'Descuentos' },
    { href: '/wallet',   icon: FiCreditCard, label: 'Wallet'     },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="bg-secondary sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-lg font-black text-secondary shadow-yellow group-hover:scale-105 transition-transform">
              🎁
            </div>
            <div className="leading-none">
              <p className="text-surface font-bold text-base tracking-tight">StudyBenefits</p>
              <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase">powered by SanTokens</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const active = router.pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-primary text-secondary'
                      : 'text-white/60 hover:text-surface hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {balance !== null && (
                  <div className="token-chip">
                    <img src="/images/santoken.png.webp" alt="ST"
                      className="w-4 h-4 rounded-full object-cover" />
                    <span>{balance}</span>
                  </div>
                )}
                <button onClick={handleLogout} title="Cerrar sesion"
                  className="p-2 rounded-lg text-white/50 hover:text-danger hover:bg-white/10 transition-colors">
                  <FiLogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link href="/login"
                className="btn-primary px-4 py-2 text-sm">
                <FiLogIn className="w-4 h-4" />
                Ingresar
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-white/10">
          {navLinks.map(({ href, icon: Icon, label }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide uppercase transition-colors
                  ${active ? 'text-primary' : 'text-white/50 hover:text-surface'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-secondary border-t border-white/10 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <p className="text-white/30 text-xs">
            StudyBenefits &mdash; Canjea tus SanTokens por recompensas reales
          </p>
          <span className="text-primary text-xs font-semibold">🎁</span>
        </div>
      </footer>
    </div>
  );
}
