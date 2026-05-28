import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FiHeart, FiUsers, FiMessageCircle } from 'react-icons/fi';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/matching/matches')
      .then(res => setMatches(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">Debes <Link href="/login" className="text-primary font-semibold">iniciar sesión</Link></p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}>
              <FiHeart className="text-primary" /> Mis matches
            </h1>
            <p className="text-sm" style={{color:'#4B5563'}}>{matches.length} compañeros de estudio encontrados</p>
          </div>
          <Link href="/study-match" className="button-primary px-4 py-2 text-sm font-semibold">
            Buscar más
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💚</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aún no tenés matches</h3>
            <p className="text-gray-500 text-sm mb-6">Explorá candidatos y encontrá tu compañero de estudio ideal</p>
            <Link href="/study-match" className="button-primary px-6 py-2">
              Ir a explorar
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(match => (
              <div key={match._id} className="card flex items-center gap-4 transition-all" style={{cursor:'pointer'}}>
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold overflow-hidden flex-shrink-0">
                  {match.avatar ? (
                    <img src={`http://localhost:5000${match.avatar}`} alt={match.username} className="w-full h-full object-cover" />
                  ) : (
                    match.username.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{match.username}</p>
                  {match.studyYear && <p className="text-xs text-gray-500">{match.studyYear}</p>}
                  {match.subjects?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.subjects.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 text-xs font-bold" style={{background:'#dcfce7', color:'#16a34a', border:'1.5px solid #16a34a', borderRadius:'999px'}}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold" style={{background:'#fef9c3', color:'#854d0e', border:'1.5px solid #854d0e', borderRadius:'999px'}}>
                    <img src="/images/santoken.png.png" alt="ST" className="w-4 h-4 object-contain" style={{mixBlendMode:'multiply'}} />
                    +{match.santokensEarned}
                  </div>
                  <Link
                    href={`/chat/${match._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all"
                    style={{background:'#4CAF50', color:'#fff', border:'2px solid #1C293C', borderRadius:'8px', boxShadow:'2px 2px 0 #1C293C'}}
                  >
                    <FiMessageCircle className="w-3 h-3" /> Chat
                  </Link>
                  <p className="text-xs text-gray-400">
                    {match.matchedAt ? new Date(match.matchedAt).toLocaleDateString('es-AR') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
