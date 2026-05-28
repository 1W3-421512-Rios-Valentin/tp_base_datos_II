import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { FiArrowLeft, FiMapPin, FiTag, FiChevronRight } from 'react-icons/fi';

const TYPE_ICONS = {
  'café': '☕', 'biblioteca': '📚', 'restaurante': '🍽️',
  'bar': '🍺', 'panadería': '🥐', 'librería': '📖', 'otro': '📍'
};

export default function PlaceDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [data, setData]     = useState(null);
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

  if (authLoading || loading || !data) return null;

  const { place, benefits } = data;

  return (
    <Layout>
      <Link href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-text-main mb-6 transition-colors font-medium">
        <FiArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      {/* Place hero card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
            {TYPE_ICONS[place.type] || '📍'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-black text-text-main tracking-tight">{place.name}</h1>
              {place.isStudyPlace && (
                <span className="badge bg-blue-50 text-blue-700">📚 Ideal para estudiar</span>
              )}
            </div>
            <p className="text-sm text-gray-400 capitalize font-medium">{place.type}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
              <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{place.address}</span>
            </div>
          </div>
        </div>
        {place.description && (
          <p className="text-gray-500 mt-4 text-sm leading-relaxed border-t border-gray-50 pt-4">
            {place.description}
          </p>
        )}
      </div>

      {/* Benefits */}
      <div className="flex items-center gap-2 mb-4">
        <FiTag className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-text-main">Descuentos disponibles</h2>
        {benefits.length > 0 && (
          <span className="badge-primary">{benefits.length}</span>
        )}
      </div>

      {benefits.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FiTag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p>No hay descuentos activos en este lugar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map(benefit => (
            <Link key={benefit._id} href={`/redeem/${benefit._id}`}>
              <div className="card-hover h-full flex flex-col">
                <h3 className="font-bold text-text-main mb-1">{benefit.title}</h3>
                {benefit.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{benefit.description}</p>
                )}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/images/santoken.png.webp" alt="ST"
                      className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                    <span className="font-black font-mono text-sm text-text-main">{benefit.tokenCost}</span>
                    <span className="text-xs text-gray-400">SanTokens</span>
                  </div>
                  <span className="badge-primary flex items-center gap-1">
                    Canjear <FiChevronRight className="w-3 h-3" />
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
