import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { FiArrowLeft, FiMapPin, FiTag } from 'react-icons/fi';

const TYPE_ICONS = {
  'café': '☕',
  'biblioteca': '📚',
  'restaurante': '🍽️',
  'bar': '🍺',
  'panadería': '🥐',
  'librería': '📖',
  'otro': '📍'
};

export default function PlaceDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!id) return;
    api.get(`/places/${id}`)
      .then(res => setData(res.data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (authLoading || loading) return null;
  if (!data) return null;

  const { place, benefits } = data;

  return (
    <Layout>
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <FiArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      {/* Place header */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            {TYPE_ICONS[place.type] || '📍'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{place.name}</h1>
              {place.isStudyPlace && (
                <span className="badge bg-blue-50 text-blue-700">📚 Ideal para estudiar</span>
              )}
            </div>
            <p className="text-gray-500 text-sm capitalize mt-0.5">{place.type}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
              <FiMapPin className="w-3.5 h-3.5" />
              <span>{place.address}</span>
            </div>
          </div>
        </div>
        {place.description && (
          <p className="text-gray-600 mt-4 text-sm leading-relaxed">{place.description}</p>
        )}
      </div>

      {/* Benefits */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FiTag className="w-5 h-5 text-amber-500" />
        Descuentos disponibles
      </h2>

      {benefits.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>No hay descuentos activos en este lugar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map(benefit => (
            <Link key={benefit._id} href={`/redeem/${benefit._id}`}>
              <div className="card hover:shadow-md hover:border-amber-200 transition-all cursor-pointer h-full">
                <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                {benefit.description && (
                  <p className="text-sm text-gray-500 mt-1">{benefit.description}</p>
                )}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-amber-700">{benefit.tokenCost} SanTokens</span>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
                    Canjear
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
