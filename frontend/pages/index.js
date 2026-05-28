import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';
import ResourceCard from '../components/ResourceCard';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiBook, FiUsers, FiZap, FiTarget } from 'react-icons/fi';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const CATEGORIES = ['Todos', 'Matemática', 'Física', 'Química', 'Biología', 'Programación', 'Economía', 'Otros'];

const CAROUSEL_SLIDES = [
  { src: '/images/carousel/slide-1.png', alt: 'Gana Santokens con cada match' },
  { src: '/images/carousel/slide-2.png', alt: 'Excelencia académica' },
  { src: '/images/carousel/slide-3.png', alt: 'Universidades de todo el mundo' },
  { src: '/images/carousel/slide-4.png', alt: 'Encontrá compañeros de estudio' },
];

const LandingPage = () => {
  return (
    <Layout>
      <style jsx>{`\n        @keyframes fadeInUp {\n          from {\n            opacity: 0;\n            transform: translateY(30px);\n          }\n          to {\n            opacity: 1;\n            transform: translateY(0);\n          }\n        }\n        .fade-in-up {\n          animation: fadeInUp 0.8s ease-out forwards;\n          opacity: 0;\n        }\n        .swiper-container {\n          border-radius: 1.5rem;\n          overflow: hidden;\n        }\n      `}</style>

      {/* Hero Section */}
      <div className="relative min-h-screen -mx-4 -my-8 overflow-hidden flex items-center" style={{ background: '#FBFBF9' }}>
        <div className="max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text */}
            <div className="space-y-6 z-10">
              <h1 className="fade-in-up text-5xl lg:text-6xl font-black leading-tight tracking-tight" style={{ animationDelay: '0s', color: '#1C293C', fontFamily: 'Inter, Poppins, sans-serif' }}>
                Todos tus archivos <span style={{ color: '#4CAF50' }}>en un mismo lugar</span>
              </h1>
              <p className="fade-in-up text-xl leading-relaxed" style={{ animationDelay: '0.2s', color: '#4B5563', fontFamily: 'Inter, Poppins, sans-serif' }}>
                Hecho por estudiantes, para estudiantes. Comparte apuntes, ejercicios y resumenes con tu comunidad académica.
              </p>
              <div className="flex flex-wrap gap-4 pt-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 font-bold transition-all active:translate-x-[2px] active:translate-y-[2px]"
                  style={{ background: '#4CAF50', color: '#fff', border: '2px solid #1C293C', borderRadius: '10px', boxShadow: '4px 4px 0 #1C293C', fontFamily: 'Inter, Poppins, sans-serif' }}
                >
                  Comienza ahora
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 font-bold transition-all active:translate-x-[2px] active:translate-y-[2px]"
                  style={{ background: '#FBFBF9', color: '#1C293C', border: '2px solid #1C293C', borderRadius: '10px', boxShadow: '4px 4px 0 #1C293C', fontFamily: 'Inter, Poppins, sans-serif' }}
                >
                  Inicia sesión
                </Link>
              </div>
            </div>

            {/* Right Side - Carousel */}
            <div className="relative overflow-hidden" style={{ border: '2.5px solid #1C293C', borderRadius: '14px', boxShadow: '6px 6px 0 #1C293C' }}>
              <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                className="w-full"
              >
                {CAROUSEL_SLIDES.map((slide, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full bg-white flex items-center justify-center" style={{ height: '360px' }}>
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                        priority={index === 0}
                      />
                    </div>
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
                  className="fade-in-up card transition-all hover:-translate-y-1"
                  style={{ animationDelay: feature.delay, border: '2px solid #1C293C', borderRadius: '12px', boxShadow: '4px 4px 0 #1C293C', fontFamily: 'Inter, Poppins, sans-serif' }}
                >
                  <div className="mb-3" style={{ color: '#4CAF50' }}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg mb-2" style={{ fontWeight: 700, color: '#1C293C' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: '#4B5563' }}>{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="p-12 text-center fade-in-up mt-20" style={{ animationDelay: '1.4s', background: '#4CAF50', border: '2.5px solid #1C293C', borderRadius: '16px', boxShadow: '6px 6px 0 #1C293C', fontFamily: 'Inter, Poppins, sans-serif' }}>
            <h2 className="text-3xl mb-4" style={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>¿Listo para transformar tu forma de estudiar?</h2>
            <p className="mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.92)' }}>Únete a miles de estudiantes que ya comparten y descubren material académico</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 font-bold transition-all active:translate-x-[2px] active:translate-y-[2px]"
              style={{ background: '#FBFBF9', color: '#1C293C', border: '2px solid #1C293C', borderRadius: '10px', boxShadow: '4px 4px 0 #1C293C' }}
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
