import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FiHeart, FiClock } from 'react-icons/fi';

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/wallet/balance'),
      api.get('/wallet/history')
    ]).then(([balRes, histRes]) => {
      setBalance(balRes.data.balance);
      setHistory(histRes.data.transactions);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">Debes <Link href="/login" className="text-primary font-semibold">iniciar sesión</Link></p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <img src="/images/santoken.png.webp" alt="SanToken" className="w-8 h-8 rounded-full object-cover border-2 border-yellow-300 shadow" />
          Mi Wallet
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Saldo */}
            <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 text-white p-8 mb-6 shadow-lg shadow-orange-100">
              <p className="text-yellow-100 text-sm font-medium mb-3">Saldo disponible</p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src="/images/santoken.png.webp"
                    alt="SanToken"
                    className="w-20 h-20 rounded-full object-cover border-4 border-yellow-200 shadow-xl"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(255,200,0,0.6))' }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs">💰</div>
                </div>
                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold">{balance ?? 0}</span>
                    <span className="text-yellow-100 text-lg mb-1">SanTokens</span>
                  </div>
                  <p className="text-yellow-100 text-xs mt-1">Usá tus tokens para obtener beneficios y descuentos</p>
                </div>
              </div>
            </div>

            {/* Cómo ganar más */}
            <div className="card border border-gray-100 mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">¿Cómo ganar más tokens?</h3>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <FiHeart className="text-primary w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Cada match con un compañero de estudio te da <strong>10 SanTokens</strong></span>
              </div>
            </div>

            {/* Historial */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiClock className="text-gray-400" /> Historial
              </h2>

              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">💰</div>
                  <p className="text-gray-500 text-sm mb-4">Aún no tenés transacciones</p>
                  <Link href="/study-match" className="button-primary px-5 py-2 text-sm">
                    Encontrar compañeros
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((tx, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                        <img src="/images/santoken.png.webp" alt="SanToken" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                        <p className="text-xs text-gray-400">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                        </p>
                      </div>
                      <div className="text-green-600 font-bold text-sm flex-shrink-0">
                        +{tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
