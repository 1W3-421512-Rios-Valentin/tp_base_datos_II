import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FiX, FiHeart, FiUsers, FiBook, FiGlobe, FiMapPin } from 'react-icons/fi';

function MatchModal({ matchedUser, santokens, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(28,41,60,0.7)', backdropFilter:'blur(2px)'}}>
      <div className="bg-white p-8 max-w-sm w-full mx-4 text-center" style={{border:'2px solid #1C293C', borderRadius:'14px', boxShadow:'8px 8px 0 #1C293C'}}>
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black mb-2" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}>!¡Es un match!</h2>
        <p className="mb-6" style={{color:'#4B5563'}}>
          Vos y <span className="font-bold" style={{color:'#4CAF50'}}>{matchedUser.username}</span> quieren estudiar juntos
        </p>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden" style={{background:'#4CAF50', color:'#fff', border:'3px solid #1C293C', boxShadow:'3px 3px 0 #1C293C'}}>
            {matchedUser.avatar ? (
              <img src={`http://localhost:5000${matchedUser.avatar}`} alt={matchedUser.username} className="w-full h-full object-cover" />
            ) : (
              matchedUser.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 font-bold mb-6" style={{background:'#fef9c3', border:'2px solid #854d0e', borderRadius:'999px', color:'#854d0e'}}>
          <img src="/images/santoken.png.png" alt="SanToken" className="w-6 h-6 object-contain" style={{mixBlendMode:'multiply'}} />
          +{santokens} SanTokens ganados
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-bold transition-all"
            style={{background:'#FBFBF9', color:'#1C293C', border:'2px solid #1C293C', borderRadius:'10px', boxShadow:'3px 3px 0 #1C293C', cursor:'pointer'}}
            onMouseEnter={e => { e.currentTarget.style.transform='translate(-1px,-1px)'; e.currentTarget.style.boxShadow='4px 4px 0 #1C293C'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='3px 3px 0 #1C293C'; }}
          >
            Seguir explorando
          </button>
          <Link
            href={`/chat/${matchedUser._id}`}
            className="flex-1 py-3 font-bold transition-all text-center flex items-center justify-center gap-2"
            style={{background:'#4CAF50', color:'#fff', border:'2px solid #1C293C', borderRadius:'10px', boxShadow:'3px 3px 0 #1C293C', textDecoration:'none'}}
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
      className="absolute inset-0 bg-white flex flex-col overflow-hidden"
      style={{border:'2px solid #1C293C', borderRadius:'14px', boxShadow:'6px 6px 0 #1C293C', ...transformStyle}}
    >
      {/* Header con avatar */}
      <div className="p-6 text-white flex-shrink-0" style={{background:'#4CAF50', borderBottom:'2px solid #1C293C'}}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0" style={{background:'rgba(255,255,255,0.25)', border:'2px solid rgba(255,255,255,0.6)'}}>
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
                <span key={s} className="px-2.5 py-1 text-xs font-bold" style={{background:'#dcfce7', color:'#16a34a', border:'1.5px solid #16a34a', borderRadius:'999px'}}>{s}</span>
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
                <span key={l} className="px-2.5 py-1 text-xs font-bold" style={{background:'#dbeafe', color:'#1d4ed8', border:'1.5px solid #1d4ed8', borderRadius:'999px'}}>{l}</span>
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
            className="flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-all"
            style={{background:'#FBFBF9', color:'#dc2626', border:'2px solid #dc2626', borderRadius:'10px', boxShadow:'3px 3px 0 #dc2626', cursor:'pointer'}}
            onMouseEnter={e => { e.currentTarget.style.transform='translate(-1px,-1px)'; e.currentTarget.style.boxShadow='4px 4px 0 #dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='3px 3px 0 #dc2626'; }}
          >
            <FiX className="w-5 h-5" /> Pasar
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-all"
            style={{background:'#4CAF50', color:'#fff', border:'2px solid #1C293C', borderRadius:'10px', boxShadow:'3px 3px 0 #1C293C', cursor:'pointer'}}
            onMouseEnter={e => { e.currentTarget.style.transform='translate(-1px,-1px)'; e.currentTarget.style.boxShadow='4px 4px 0 #1C293C'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='3px 3px 0 #1C293C'; }}
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
            <h1 className="text-2xl font-black" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}>Compañeros de estudio</h1>
            <p className="text-sm" style={{color:'#4B5563'}}>Encontrá tu match académico</p>
          </div>
          <Link href="/matches" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition-all" style={{color:'#4CAF50', border:'2px solid #1C293C', borderRadius:'8px', boxShadow:'2px 2px 0 #1C293C', background:'#FBFBF9'}}>
            <FiUsers className="w-4 h-4" /> Mis matches
          </Link>
        </div>

        {!user.studyYear && !user.subjects?.length && (
          <div className="mb-4 p-4 text-sm" style={{background:'#fef9c3', border:'2px solid #854d0e', borderRadius:'10px', color:'#854d0e', fontWeight:600}}>
            Completá tu <Link href="/edit-profile" className="underline">perfil de estudio</Link> para obtener mejores matches.
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
