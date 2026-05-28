import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import { FiTag, FiArrowRight } from 'react-icons/fi';

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance]         = useState(0);
  const [username, setUsername]       = useState('');
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/wallet/balance'),
      api.get('/wallet/redemptions')
    ]).then(([wRes, rRes]) => {
      setBalance(wRes.data.balance);
      setUsername(wRes.data.username);
      setRedemptions(rRes.data.redemptions);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-text-main tracking-tight">Mi Wallet</h1>
        <p className="text-gray-400 text-sm mt-1">Saldo y canjes realizados</p>
      </div>

      {/* Balance card */}
      <div className="bg-secondary rounded-2xl p-7 mb-8 relative overflow-hidden shadow-yellow">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 bg-primary/10 rounded-full pointer-events-none" />
        {/* Yellow top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-2xl" />

        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-1">Cuenta</p>
        <p className="text-surface font-bold text-lg mb-4">{username}</p>

        <div className="flex items-end gap-4">
          <img src="/images/santoken.png.webp" alt="SanToken"
            className="w-14 h-14 rounded-full object-cover border-2 border-primary/40 shadow-yellow" />
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold leading-none mb-1">
              Saldo actual
            </p>
            <p className="text-primary font-black text-5xl leading-none font-mono">{balance}</p>
            <p className="text-white/50 text-sm font-medium mt-1">SanTokens</p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/30 text-xs">{redemptions.length} canje{redemptions.length !== 1 ? 's' : ''} realizados</p>
          <Link href="/benefits">
            <button className="btn-primary px-4 py-2 text-sm">
              Ver descuentos <FiArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Historial */}
      <div className="flex items-center gap-2 mb-4">
        <FiTag className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-bold text-text-main">Historial de canjes</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : redemptions.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-3">🎁</span>
          <p className="font-semibold text-gray-500 mb-1">Aun no realizaste ningun canje</p>
          <p className="text-sm text-gray-400 mb-5">Gana tokens con matches de estudio y canjealos aqui</p>
          <Link href="/benefits">
            <button className="btn-primary">Ver descuentos disponibles</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {redemptions.map(r => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-main truncate">
                    {r.benefit?.title || 'Beneficio'}
                  </h3>
                  {r.benefit?.place && (
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                      {r.benefit.place.name} &middot; {r.benefit.place.type}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                </div>

                <div className="text-right flex-shrink-0 space-y-1.5">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="font-black font-mono text-danger text-sm">-{r.tokensSpent}</span>
                    <img src="/images/santoken.png.webp" alt="ST"
                      className="w-4 h-4 rounded-full object-cover border border-gray-200" />
                  </div>
                  <span className={`badge text-[10px] uppercase tracking-wide
                    ${r.usedAt ? 'badge-neutral' : 'badge-success'}`}>
                    {r.usedAt ? 'Usado' : 'Activo'}
                  </span>
                </div>
              </div>

              {/* Code */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Codigo</span>
                <code className="font-mono font-black tracking-[0.2em] text-sm text-secondary
                                 bg-primary px-3 py-1 rounded-lg select-all">
                  {r.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
