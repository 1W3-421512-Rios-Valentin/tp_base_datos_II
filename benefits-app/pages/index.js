import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import api from '../lib/api';
import { FiMapPin, FiNavigation, FiTag, FiRefreshCw } from 'react-icons/fi';

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
  { label: 'Todos', value: '' },
  { label: 'Cafés', value: 'café' },
  { label: 'Bibliotecas', value: 'biblioteca' },
  { label: 'Para estudiar', value: 'study' }
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [location, setLocation] = useState(null);
  const [filter, setFilter] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading]);

  const getLocation = () => {
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(coords);
        setLocating(false);
        fetchNearby(coords, filter);
      },
      () => {
        // Si falla, usar coords de Córdoba como fallback para demo
        const fallback = { lat: -31.4167, lon: -64.1833 };
        setLocation(fallback);
        setLocating(false);
        setGeoError('Usando ubicación de Córdoba (GPS no disponible)');
        fetchNearby(fallback, filter);
      }
    );
  };

  const fetchNearby = async (coords, currentFilter) => {
    setLoading(true);
    try {
      const params = {
        lat: coords.lat,
        lon: coords.lon,
        radius: 10000
      };
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

  const handleFilter = (val) => {
    setFilter(val);
    if (location) fetchNearby(location, val);
  };

  useEffect(() => {
    if (user) getLocation();
  }, [user]);

  if (authLoading) return null;

  const formatDistance = (m) => {
    if (!m) return '';
    if (m < 1000) return `${m} m`;
    return `${(m / 1000).toFixed(1)} km`;
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lugares cercanos</h1>
        <p className="text-gray-500 mt-1">Encuentra cafés, bibliotecas y lugares para estudiar cerca tuyo</p>
      </div>

      {/* Location bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500">
          <FiMapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
          {location
            ? geoError
              ? geoError
              : `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
            : 'Obteniendo ubicacion...'}
        </div>
        <button
          onClick={() => getLocation()}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-60"
        >
          {locating ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiNavigation className="w-4 h-4" />}
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${filter === f.value
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Places list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📍</div>
          <p className="text-gray-500">No hay lugares en el radio seleccionado</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {places.map(place => (
            <Link key={place._id} href={`/places/${place._id}`}>
              <div className="card hover:shadow-md hover:border-green-200 transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{TYPE_ICONS[place.type] || '📍'}</span>
                      <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">{place.address}</p>
                    {place.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                    )}
                  </div>
                  {place.distance !== undefined && (
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        {formatDistance(place.distance)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  {place.isStudyPlace && (
                    <span className="badge bg-blue-50 text-blue-700">
                      📚 Para estudiar
                    </span>
                  )}
                  {place.benefitCount > 0 && (
                    <span className="badge bg-amber-50 text-amber-700">
                      <FiTag className="w-3 h-3" />
                      {place.benefitCount} {place.benefitCount === 1 ? 'descuento' : 'descuentos'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
