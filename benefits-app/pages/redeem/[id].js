import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import {
  FiArrowLeft, FiCheckCircle, FiAlertCircle, FiMapPin
} from 'react-icons/fi';

export default function RedeemPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [benefit, setBenefit]   = useState(null);
  const [balance, setBalance]   = useState(0);
  const [loading, setLoading]   = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

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
    } catch (err) {
      setError(err.response?.data?.message || 'Error al canjear');
    } finally {
      setRedeeming(false);
    }
  };

  if (authLoading || loading) return null;
  if (!benefit) return null;

  const canAfford = balance >= benefit.tokenCost;
  const newBalance = balance - benefit.tokenCost;

  /* ── SUCCESS ───────────────────────────────────────────── */
  if (result) {
    return (
      <Layout>
        <div className="max-w-sm mx-auto pt-8 text-center">
          {/* Check icon */}
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-black text-text-main mb-1">Canje exitoso</h2>
          <p className="text-gray-400 mb-8 text-sm">
            Mostra este codigo en <strong className="text-text-main">{result.placeName}</strong>
          </p>

          {/* Code card */}
          <div className="bg-secondary rounded-2xl p-8 mb-6 shadow-yellow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-t-2xl" />
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-semibold mb-4">
              Codigo de canje
            </p>
            <div className="font-mono font-black text-5xl text-primary tracking-[0.25em] select-all">
              {result.code}
            </div>
            <p className="text-white/30 text-xs mt-5 font-medium">Valido por uso unico</p>
          </div>

          {/* Tokens spent */}
          <div className="inline-flex items-center gap-2.5 bg-secondary/5 border border-gray-200
                          rounded-xl px-5 py-3 text-sm font-semibold text-text-main mb-8">
            <img src="/images/santoken.png.webp" alt="ST"
              className="w-5 h-5 rounded-full object-cover border border-gray-200" />
            <span>
              Se descontaron <span className="font-black text-danger font-mono">
                -{result.tokensSpent}
              </span> SanTokens
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Link href="/benefits">
              <button className="btn-ghost">Ver mas descuentos</button>
            </Link>
            <Link href="/wallet">
              <button className="btn-secondary">Mi wallet</button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── CONFIRM ───────────────────────────────────────────── */
  return (
    <Layout>
      <Link href="/benefits"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-text-main mb-6 transition-colors font-medium">
        <FiArrowLeft className="w-4 h-4" />
        Volver a descuentos
      </Link>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Benefit info */}
        <div className="card">
          {benefit.place && (
            <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-400 font-medium">
              <FiMapPin className="w-3.5 h-3.5" />
              <span className="capitalize">{benefit.place.name} &middot; {benefit.place.type}</span>
              {benefit.place.address && <span>&middot; {benefit.place.address}</span>}
            </div>
          )}
          <h1 className="text-2xl font-black text-text-main tracking-tight mb-2">{benefit.title}</h1>
          {benefit.description && (
            <p className="text-gray-500 leading-relaxed">{benefit.description}</p>
          )}
        </div>

        {/* Cost summary */}
        <div className="card">
          <div className="flex items-center justify-between">
            {/* Cost */}
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Costo</p>
              <div className="flex items-center gap-2.5">
                <img src="/images/santoken.png.webp" alt="ST"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                <span className="text-4xl font-black text-text-main font-mono">{benefit.tokenCost}</span>
                <span className="text-sm text-gray-400 font-medium">SanTokens</span>
              </div>
            </div>

            {/* Balance */}
            <div className="text-right">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Tu saldo</p>
              <p className={`text-3xl font-black font-mono
                ${canAfford ? 'text-text-main' : 'text-danger'}`}>
                {balance}
              </p>
              {!canAfford && (
                <p className="text-xs text-danger font-medium mt-1">
                  Faltan {benefit.tokenCost - balance} tokens
                </p>
              )}
            </div>
          </div>

          {canAfford && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-sm">
              <span className="text-gray-400 font-medium">Saldo despues del canje</span>
              <span className="font-black font-mono text-text-main">{newBalance} tokens</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-danger
                          rounded-xl px-4 py-3 text-sm font-medium">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* CTA */}
        <button onClick={handleRedeem} disabled={!canAfford || redeeming}
          className="btn-primary w-full py-4 text-base">
          {redeeming
            ? 'Procesando...'
            : !canAfford
              ? 'Saldo insuficiente'
              : `Canjear ${benefit.tokenCost} SanTokens`}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          Esta accion es irreversible. El codigo se genera una sola vez.
        </p>
      </div>
    </Layout>
  );
}
