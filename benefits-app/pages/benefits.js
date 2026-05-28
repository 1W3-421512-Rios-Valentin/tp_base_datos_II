import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../lib/api';
import { FiTag, FiMapPin } from 'react-icons/fi';

export default function BenefitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [benefits, setBenefits] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const canAfford = (cost) => balance >= cost;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Descuentos disponibles</h1>
        <p className="text-gray-500 mt-1">Canjea tus SanTokens por beneficios reales</p>
      </div>

      {/* Balance highlight */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-5 mb-6 text-white shadow-md">
        <p className="text-sm font-medium opacity-90">Tu saldo actual</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-4xl font-black">{balance}</span>
          <div>
            <img src="/images/santoken.png.webp" alt="SanToken" className="w-8 h-8 rounded-full object-cover border-2 border-yellow-200" />
            <p className="text-sm opacity-80">SanTokens</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar descuento o lugar..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
      />

      {/* Benefits grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FiTag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay descuentos disponibles</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(benefit => {
            const affordable = canAfford(benefit.tokenCost);
            return (
              <Link key={benefit._id} href={`/redeem/${benefit._id}`}>
                <div className={`card hover:shadow-md transition-all cursor-pointer h-full
                  ${!affordable ? 'opacity-60' : 'hover:border-green-200'}`}
                >
                  {/* Place */}
                  {benefit.place && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 capitalize">
                        {benefit.place.name} · {benefit.place.type}
                      </span>
                    </div>
                  )}

                  <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                  {benefit.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{benefit.description}</p>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <img src="/images/santoken.png.webp" alt="SanToken" className="w-5 h-5 rounded-full object-cover border border-yellow-300" />
                      <span className={`font-bold text-sm ${affordable ? 'text-amber-700' : 'text-red-500'}`}>
                        {benefit.tokenCost} SanTokens
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium
                      ${affordable
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {affordable ? 'Canjear' : 'Sin fondos'}
                    </span>
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
