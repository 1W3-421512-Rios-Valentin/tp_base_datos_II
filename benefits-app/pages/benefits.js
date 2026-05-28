import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import { FiTag, FiMapPin, FiSearch, FiChevronRight } from 'react-icons/fi';

export default function BenefitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [benefits, setBenefits] = useState([]);
  const [balance, setBalance]   = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/benefits'),
      api.get('/wallet/balance')
    ]).then(([bRes, wRes]) => {
      setBenefits(bRes.data.benefits);
      setBalance(wRes.data.balance);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return null;

  const filtered = benefits.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.place?.name.toLowerCase().includes(search.toLowerCase())
  );

  const canAfford = cost => balance >= cost;

  return (
    <Layout>
      {/* Page header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Descuentos</h1>
          <p className="text-gray-400 text-sm mt-1">Canjea tus SanTokens por beneficios reales</p>
        </div>

        {/* Balance chip */}
        <div className="flex items-center gap-2.5 bg-secondary text-surface rounded-2xl px-5 py-3 shadow-yellow">
          <img src="/images/santoken.png.webp" alt="ST"
            className="w-7 h-7 rounded-full object-cover border-2 border-primary/40" />
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold leading-none">Saldo</p>
            <p className="text-primary font-black text-xl leading-tight font-mono">{balance}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar descuento o lugar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-11"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse min-h-[140px]">
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FiTag className="w-7 h-7 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-500">Sin descuentos disponibles</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(benefit => {
            const affordable = canAfford(benefit.tokenCost);
            return (
              <Link key={benefit._id} href={`/redeem/${benefit._id}`}>
                <div className={`card h-full flex flex-col transition-all duration-150 cursor-pointer
                  ${affordable
                    ? 'hover:shadow-card-hover hover:border-primary'
                    : 'opacity-60 hover:shadow-card-hover'
                  }`}
                >
                  {/* Place label */}
                  {benefit.place && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <FiMapPin className="w-3 h-3 text-gray-300 flex-shrink-0" />
                      <span className="text-xs text-gray-400 capitalize truncate">
                        {benefit.place.name} &middot; {benefit.place.type}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-text-main mb-1 leading-snug">{benefit.title}</h3>
                  {benefit.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{benefit.description}</p>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/images/santoken.png.webp" alt="ST"
                        className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                      <span className={`font-black text-sm font-mono
                        ${affordable ? 'text-text-main' : 'text-danger'}`}>
                        {benefit.tokenCost}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">SanTokens</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg
                      ${affordable
                        ? 'bg-primary text-secondary'
                        : 'bg-red-50 text-danger'
                      }`}
                    >
                      {affordable ? 'Canjear' : 'Sin fondos'}
                      {affordable && <FiChevronRight className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
