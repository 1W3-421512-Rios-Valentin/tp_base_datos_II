import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FiX, FiHeart, FiUsers, FiBook, FiGlobe, FiMapPin } from 'react-icons/fi';

function MatchModal({ matchedUser, santokens, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Es un match!</h2>
        <p className="text-gray-500 mb-6">
          Vos y <span className="font-semibold text-primary">{matchedUser.username}</span> quieren estudiar juntos
        </p>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
            {matchedUser.avatar ? (
              <img src={`http://localhost:5000${matchedUser.avatar}`} alt={matchedUser.username} className="w-full h-full object-cover" />
            ) : (
              matchedUser.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 font-semibold mb-6">
          <img src="/images/santoken.png.webp" alt="SanToken" className="w-6 h-6 rounded-full object-cover border border-yellow-300" />
          +{santokens} SanTokens ganados
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Seguir explorando
          </button>
          <Link
            href={`/chat/${matchedUser._id}`}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-green-600 transition-all text-center flex items-center justify-center gap-2"
          >
            💬 Abrir chat
          </Link>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate, onSwipe, isTop }) {
  const [direction, setDirection] = useState(null);

  const handleSwipe = (dir) => {
    setDirection(dir);
    setTimeout(() => onSwipe(dir), 300);
  };

  useEffect(() => {
    if (!isTop) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') handleSwipe('right');
      if (e.key === 'ArrowLeft') handleSwipe('left');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isTop]);

  const transformStyle = !direction ? {} : direction === 'right'
    ? { transform: 'translateX(120%) rotate(20deg)', opacity: 0, transition: 'all 0.3s ease' }
    : { transform: 'translateX(-120%) rotate(-20deg)', opacity: 0, transition: 'all 0.3s ease' };

  return (
    <div
      className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden"
      style={transformStyle}
    >
      {/* Header con avatar */}
      <div className="bg-gradient-to-br from-primary to-green-400 p-6 text-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0">
            {candidate.avatar ? (
              <img src={`http://localhost:5000${candidate.avatar}`} alt={candidate.username} className="w-full h-full object-cover" />
            ) : (
              candidate.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{candidate.username}</h2>
            {candidate.studyYear && (
              <span className="text-green-100 text-sm">{candidate.studyYear}</span>
            )}
          </div>
          {candidate.compatibilityScore > 0 && (
            <div className="ml-auto text-center">
              <div className="text-2xl font-bold">{Math.min(candidate.compatibilityScore * 10, 99)}%</div>
              <div className="text-green-100 text-xs">compatible</div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {candidate.bio && (
          <p className="text-gray-600 text-sm italic">"{candidate.bio}"</p>
        )}

        {candidate.subjects?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <FiBook className="w-3.5 h-3.5" /> Materias
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.subjects.map(s => (
                <span key={s} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {candidate.languages?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <FiGlobe className="w-3.5 h-3.5" /> Idiomas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.languages.map(l => (
                <span key={l} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
        )}

        {candidate.location?.lat && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FiMapPin className="w-3.5 h-3.5" /> Ubicación disponible
          </div>
        )}
      </div>

      {/* Botones */}
      {isTop && (
        <div className="p-6 pt-0 flex gap-4 flex-shrink-0">
          <button
            onClick={() => handleSwipe('left')}
            className="flex-1 py-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <FiX className="w-5 h-5" /> Pasar
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex-1 py-4 rounded-xl bg-primary text-white hover:bg-green-600 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            <FiHeart className="w-5 h-5" /> ¡Estudiar!
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudyMatch() {
  const router = useRouter();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchResult, setMatchResult] = useState(null);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCandidates();
  }, [user]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matching/candidates');
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = useCallback(async (direction) => {
    if (swiping || candidates.length === 0) return;
    const current = candidates[0];
    setSwiping(true);
    try {
      const res = await api.post('/matching/swipe', {
        targetUserId: current._id,
        direction
      });
      if (res.data.match) {
        setMatchResult({ matchedUser: res.data.matchedWith, santokens: res.data.santokensEarned });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCandidates(prev => prev.slice(1));
      setSwiping(false);
    }
  }, [candidates, swiping]);

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">Debes <Link href="/login" className="text-primary font-semibold">iniciar sesión</Link> para encontrar compañeros</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {matchResult && (
        <MatchModal
          matchedUser={matchResult.matchedUser}
          santokens={matchResult.santokens}
          onClose={() => setMatchResult(null)}
        />
      )}

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Compañeros de estudio</h1>
            <p className="text-sm text-gray-500">Encontrá tu match académico</p>
          </div>
          <Link href="/matches" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-primary text-sm font-medium hover:bg-green-100 transition-all">
            <FiUsers className="w-4 h-4" /> Mis matches
          </Link>
        </div>

        {!user.studyYear && !user.subjects?.length && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
            Completá tu <Link href="/edit-profile" className="font-semibold underline">perfil de estudio</Link> para obtener mejores matches.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Sin más candidatos</h3>
            <p className="text-gray-500 text-sm mb-6">Por ahora viste a todos. Volvé más tarde o completá tu perfil.</p>
            <button onClick={fetchCandidates} className="button-primary px-6 py-2">
              Actualizar
            </button>
          </div>
        ) : (
          <>
            <div className="relative h-[520px]">
              {candidates.slice(0, 3).reverse().map((candidate, i) => {
                const isTop = i === candidates.slice(0, 3).length - 1;
                return (
                  <div
                    key={candidate._id}
                    className="absolute inset-0"
                    style={{
                      transform: !isTop ? `scale(${0.95 - (candidates.slice(0, 3).length - 1 - i) * 0.03}) translateY(${(candidates.slice(0, 3).length - 1 - i) * 10}px)` : undefined,
                      zIndex: i,
                    }}
                  >
                    <CandidateCard
                      candidate={candidate}
                      onSwipe={handleSwipe}
                      isTop={isTop}
                    />
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
              Usá ← → del teclado o los botones para navegar · {candidates.length} candidatos
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
