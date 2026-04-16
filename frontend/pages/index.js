import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';
import ResourceCard from '../components/ResourceCard';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiBook, FiUsers, FiZap, FiTarget } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CATEGORIES = ['Todos', 'Matemática', 'Física', 'Química', 'Biología', 'Programación', 'Economía', 'Otros'];

const CAROUSEL_IMAGES = [
  '/images/carousel/slide-1.png',
  '/images/carousel/slide-2.png',
  '/images/carousel/slide-3.png',
];

const LandingPage = () => {
  return (
    <Layout>
      <style jsx>{`\n        @keyframes fadeInUp {\n          from {\n            opacity: 0;\n            transform: translateY(30px);\n          }\n          to {\n            opacity: 1;\n            transform: translateY(0);\n          }\n        }\n        .fade-in-up {\n          animation: fadeInUp 0.8s ease-out forwards;\n          opacity: 0;\n        }\n        .swiper-container {\n          border-radius: 1.5rem;\n          overflow: hidden;\n        }\n      `}</style>

      {/* Hero Section */}
      <div className="relative min-h-screen -mx-4 -my-8 overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text */}
            <div className="space-y-6 z-10">
              <h1 className="fade-in-up title text-5xl lg:text-6xl leading-tight" style={{ animationDelay: '0s' }}>
                Todos tus archivos <span className="title-highlight">en un mismo lugar</span>
              </h1>
              <p className="fade-in-up text-xl text-muted leading-relaxed" style={{ animationDelay: '0.2s' }}>
                Hecho por estudiantes, para estudiantes. Comparte apuntes, ejercicios y resumenes con tu comunidad académica.
              </p>
              <div className="flex gap-4 pt-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link
                  href="/register"
                  className="button-primary inline-flex items-center gap-2 px-8 py-4 font-semibold shadow-lg hover:shadow-xl"
                >
                  Comienza ahora
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-secondary border-2 border-secondary rounded-lg font-semibold hover:bg-blue-50 transition-all"
                >
                  Inicia sesión
                </Link>
              </div>
            </div>

            {/* Right Side - Carousel */}
            <div className="relative carousel-item bg-gray-100">
              <Swiper
                modules={[Autoplay, EffectFade, Navigation, Pagination]}
                effect="fade"
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={true}
                loop={true}
                autoHeight={true}
                className="w-full"
              >
                {CAROUSEL_IMAGES.map((imageSrc, index) => (
                  <SwiperSlide key={imageSrc}>
                    <img
                      src={imageSrc}
                      alt={`Slide ${index + 1}`}
                      className="block w-full h-auto object-contain"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              {
                icon: FiBook,
                title: 'Los mejores resumenes',
                desc: 'Acceso a apuntes de calidad verificados por la comunidad',
                delay: '0.6s'
              },
              {
                icon: FiUsers,
                title: 'Red de estudiantes',
                desc: 'Conecta con otros estudiantes y comparte conocimiento',
                delay: '0.8s'
              },
              {
                icon: FiZap,
                title: 'Rápido y fácil',
                desc: 'Sube, descarga y organiza tus materiales al instante',
                delay: '1s'
              },
              {
                icon: FiTarget,
                title: 'Prioriza tu tiempo',
                desc: 'Encuentra exactamente lo que necesitas en segundos',
                delay: '1.2s'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="fade-in-up card border border-gray-100 hover:shadow-md hover:border-primary transition-all"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="text-primary text-3xl mb-3">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">{feature.title}</h3>
                  <p className="text-muted text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-12 shadow-sm text-center fade-in-up mt-20" style={{ animationDelay: '1.4s' }}>
            <h2 className="text-3xl font-bold text-white mb-4">¿Listo para transformar tu forma de estudiar?</h2>
            <p className="text-white mb-8 text-lg opacity-90">Únete a miles de estudiantes que ya comparten y descubren material académico</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Registrarse gratis
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const HomePage = () => {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResources(search, category);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [category, search]);

  const fetchResources = async (searchText = '', selectedCategory = 'Todos') => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'Todos') {
        params.category = selectedCategory;
      }
      if (searchText && searchText.trim()) {
        params.search = searchText.trim();
      }
      const res = await api.get('/resources', { params });
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchResources(search, category);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Buscar apuntes, ejercicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay recursos todavía.</p>
            <p className="text-sm text-gray-400 mt-1">¡Sé el primero en subir material!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return user ? <HomePage /> : <LandingPage />;
}
