import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import { FiTag } from 'react-icons/fi';

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setRedemptions(rRes.data.redemptions);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Wallet</h1>
        <p className="text-gray-500 mt-1">Tu saldo y canjes realizados</p>
      </div>

      {/* Balance card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-6 w-20 h-20 bg-white/10 rounded-full" />
        <p className="text-white/80 text-sm font-medium">{user?.username}</p>
        <p className="text-white/70 text-xs mt-0.5">Saldo actual</p>
        <div className="flex items-end gap-3 mt-3">
          <span className="text-5xl font-black text-white">{balance}</span>
          <div className="mb-1">
            <img src="/images/santoken.png.webp" alt="SanToken" className="w-10 h-10 rounded-full object-cover border-2 border-yellow-200 shadow" />
            <p className="text-white/80 text-sm mt-1">SanTokens</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <Link href="/benefits">
            <button className="bg-white text-amber-700 font-semibold text-sm px-5 py-2 rounded-xl hover:bg-amber-50 transition-colors">
              Ver descuentos
            </button>
          </Link>
        </div>
      </div>

      {/* Redemptions history */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FiTag className="w-5 h-5 text-gray-400" />
        Historial de canjes
      </h2>

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
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-3">🎁</span>
          <p>Aun no realizaste ningun canje</p>
          <Link href="/benefits">
            <button className="mt-4 btn-primary text-sm">
              Ver descuentos disponibles
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {redemptions.map(r => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {r.benefit?.title || 'Beneficio'}
                  </h3>
                  {r.benefit?.place && (
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                      {r.benefit.place.name} · {r.benefit.place.type}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end text-red-500 font-bold">
                    <span className="text-sm">-{r.tokensSpent}</span>
                    <img src="/images/santoken.png.webp" alt="SanToken" className="w-4 h-4 rounded-full object-cover border border-yellow-300" />
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium
                      ${r.usedAt
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {r.usedAt ? 'Usado' : 'Activo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Code */}
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Codigo:</span>
                <code className="text-sm font-mono font-bold tracking-widest text-gray-700 bg-gray-50 px-3 py-1 rounded-lg">
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
