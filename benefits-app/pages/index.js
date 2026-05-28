import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import api from '../lib/api';
import { FiMapPin, FiNavigation, FiTag, FiRefreshCw, FiChevronRight } from 'react-icons/fi';

const TYPE_ICONS = {
  'café': '☕',
  'biblioteca': '📚',
  'restaurante': '🍽️',
  'bar': '🍺',
  'panadería': '🥐',
  'librería': '📖',
  'otro': '📍'
};

const FILTERS = [
  { label: 'Todos',         value: '' },
  { label: 'Cafes',         value: 'café' },
  { label: 'Bibliotecas',   value: 'biblioteca' },
  { label: 'Para estudiar', value: 'study' },
];

function formatDistance(m) {
  if (!m) return null;
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [places, setPlaces]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [geoMsg, setGeoMsg]     = useState('');
  const [location, setLocation] = useState(null);
  const [filter, setFilter]     = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  const fetchNearby = async (coords, currentFilter) => {
    setLoading(true);
    try {
      const params = { lat: coords.lat, lon: coords.lon, radius: 10000 };
      if (currentFilter === 'study') params.studyOnly = 'true';
      else if (currentFilter) params.type = currentFilter;
      const res = await api.get('/places/nearby', { params });
      setPlaces(res.data.places);
    } catch {
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLocating(true);
    setGeoMsg('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(coords);
        setLocating(false);
        fetchNearby(coords, filter);
      },
      () => {
        const fallback = { lat: -31.4167, lon: -64.1833 };
        setLocation(fallback);
        setLocating(false);
        setGeoMsg('Ubicacion de Cordoba (GPS no disponible)');
        fetchNearby(fallback, filter);
      }
    );
  };

  const handleFilter = (val) => {
    setFilter(val);
    if (location) fetchNearby(location, val);
  };

  useEffect(() => { if (user) getLocation(); }, [user]);

  if (authLoading) return null;

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-text-main tracking-tight">Lugares cercanos</h1>
        <p className="text-gray-400 mt-1 text-sm">Descubre donde estudiar y canjear tus SanTokens</p>
      </div>

      {/* Location bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2.5 bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400">
          <FiMapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="truncate">
            {locating
              ? 'Obteniendo ubicacion...'
              : geoMsg || (location
                  ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                  : 'Sin ubicacion')}
          </span>
        </div>
        <button onClick={getLocation} disabled={locating}
          className="btn-primary px-4 py-3 flex-shrink-0">
          {locating
            ? <FiRefreshCw className="w-4 h-4 animate-spin" />
            : <FiNavigation className="w-4 h-4" />}
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-7 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => handleFilter(f.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
              ${filter === f.value
                ? 'bg-secondary text-primary shadow-md'
                : 'bg-surface border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse min-h-[130px]">
              <div className="h-5 bg-gray-100 rounded-lg w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">📍</div>
          <p className="font-semibold text-gray-500">No hay lugares en el radio actual</p>
          <p className="text-sm text-gray-400 mt-1">Intenta cambiar el filtro o expandir la busqueda</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map(place => (
            <Link key={place._id} href={`/places/${place._id}`}>
              <div className="card-hover h-full flex flex-col">
                {/* Icon + name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {TYPE_ICONS[place.type] || '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-main truncate leading-tight">{place.name}</h3>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{place.type}</p>
                  </div>
                  {formatDistance(place.distance) && (
                    <span className="badge-primary text-xs flex-shrink-0">
                      {formatDistance(place.distance)}
                    </span>
                  )}
                </div>

                {place.address && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                    <FiMapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{place.address}</span>
                  </p>
                )}

                {/* Tags row */}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {place.isStudyPlace && (
                      <span className="badge bg-blue-50 text-blue-700">📚 Estudiar</span>
                    )}
                    {place.benefitCount > 0 && (
                      <span className="badge bg-primary/10 text-warning">
                        <FiTag className="w-3 h-3" />
                        {place.benefitCount} {place.benefitCount === 1 ? 'desc.' : 'descs.'}
                      </span>
                    )}
                  </div>
                  <FiChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
