import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiMapPin } from 'react-icons/fi';

export default function RedeemPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [benefit, setBenefit] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [result, setResult] = useState(null); // { code, tokensSpent, benefitTitle, placeName }
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/benefits/${id}`),
      api.get('/wallet/balance')
    ]).then(([bRes, wRes]) => {
      setBenefit(bRes.data.benefit);
      setBalance(wRes.data.balance);
    }).catch(() => router.push('/benefits'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRedeem = async () => {
    setRedeeming(true);
    setError('');
    try {
      const res = await api.post(`/benefits/${id}/redeem`);
      setResult(res.data);
      setBalance(prev => prev - res.data.tokensSpent);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al canjear');
    } finally {
      setRedeeming(false);
    }
  };

  if (authLoading || loading) return null;
  if (!benefit) return null;

  const canAfford = balance >= benefit.tokenCost;

  return (
    <Layout>
      <Link href="/benefits" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" />
        Volver a descuentos
      </Link>

      {/* Success state */}
      {result ? (
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Canje exitoso</h2>
          <p className="text-gray-500 mb-8">Mostra este codigo en {result.placeName}</p>

          {/* Code display */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-6 mx-auto max-w-xs shadow-2xl">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Codigo de canje</p>
            <div className="text-4xl font-black text-white tracking-[0.3em] font-mono">
              {result.code}
            </div>
            <p className="text-gray-500 text-xs mt-4">Valido por uso unico</p>
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            <img src="/images/santoken.png.webp" alt="SanToken" className="w-5 h-5 rounded-full object-cover border border-yellow-300" />
            <span>Se descontaron <strong>{result.tokensSpent} SanTokens</strong> de tu wallet</span>
          </div>

          <div className="mt-8 flex gap-3 justify-center">
            <Link href="/benefits">
              <button className="btn-secondary text-sm">Ver mas descuentos</button>
            </Link>
            <Link href="/wallet">
              <button className="btn-primary text-sm">Ver mi wallet</button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Benefit detail */}
          <div className="card mb-6">
            {benefit.place && (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-400">
                <FiMapPin className="w-3.5 h-3.5" />
                <span className="capitalize">{benefit.place.name} · {benefit.place.type}</span>
                {benefit.place.address && <span>· {benefit.place.address}</span>}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{benefit.title}</h1>
            {benefit.description && (
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            )}
          </div>

          {/* Cost + balance */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Costo del beneficio</p>
                <div className="flex items-center gap-2">
                  <img src="/images/santoken.png.webp" alt="SanToken" className="w-8 h-8 rounded-full object-cover border border-yellow-300" />
                  <span className="text-3xl font-black text-amber-600">{benefit.tokenCost}</span>
                  <span className="text-gray-500 text-sm">SanTokens</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-0.5">Tu saldo</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-2xl font-black text-gray-900">{balance}</span>
                  <span className="text-sm text-gray-500">tokens</span>
                </div>
                {!canAfford && (
                  <p className="text-xs text-red-500 mt-1">
                    Necesitas {benefit.tokenCost - balance} mas
                  </p>
                )}
              </div>
            </div>

            {canAfford && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Saldo despues del canje</span>
                  <span className="font-semibold text-gray-900">{balance - benefit.tokenCost} tokens</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleRedeem}
            disabled={!canAfford || redeeming}
            className="w-full btn-primary py-4 text-base"
          >
            {redeeming
              ? 'Procesando...'
              : !canAfford
                ? 'Saldo insuficiente'
                : `Canjear ${benefit.tokenCost} SanTokens`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Esta accion es irreversible. El codigo se genera una sola vez.
          </p>
        </>
      )}
    </Layout>
  );
}
