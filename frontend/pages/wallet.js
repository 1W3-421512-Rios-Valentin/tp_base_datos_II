import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FiHeart, FiClock } from 'react-icons/fi';

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/wallet/balance'),
      api.get('/wallet/history')
    ]).then(([balRes, histRes]) => {
      setBalance(balRes.data.balance);
      setHistory(histRes.data.transactions);
    }).catch(console.error)
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
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-black mb-6 flex items-center gap-2" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif', letterSpacing:'-0.02em'}}>
          <img src="/images/santoken.png.png" alt="SanToken" className="w-8 h-8 object-contain" style={{mixBlendMode:'multiply'}} />
          Mi Wallet
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Saldo */}
            <div className="p-8 mb-6" style={{background:'#4CAF50', border:'2px solid #1C293C', borderRadius:'12px', boxShadow:'6px 6px 0 #1C293C'}}>
              <p className="text-sm font-bold mb-3" style={{color:'rgba(255,255,255,0.85)'}}>Saldo disponible</p>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0" style={{width:'96px', height:'96px', borderRadius:'50%', border:'2px solid #1C293C', boxShadow:'3px 3px 0 #1C293C', overflow:'hidden', background:'#fff'}}>
                  <img
                    src="/images/santoken.png.png"
                    alt="SanToken"
                    style={{width:'100%', height:'100%', objectFit:'cover'}}
                  />
                </div>
                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black" style={{fontFamily:'Inter,Poppins,sans-serif', color:'#fff'}}>{balance ?? 0}</span>
                    <span className="text-lg mb-1 font-bold" style={{color:'rgba(255,255,255,0.85)'}}>SanTokens</span>
                  </div>
                  <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.75)'}}>Usá tus tokens para obtener beneficios y descuentos</p>
                </div>
              </div>
            </div>

            {/* Cómo ganar más */}
            <div className="card mb-6">
              <h3 className="font-bold mb-3" style={{color:'#1C293C'}}>¿Cómo ganar más tokens?</h3>
              <div className="flex items-start gap-3 text-sm" style={{color:'#4B5563'}}>
                <FiHeart className="text-primary w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Cada match con un compañero de estudio te da <strong>10 SanTokens</strong></span>
              </div>
            </div>

            {/* Historial */}
            <div>
              <h2 className="text-lg font-black mb-4 flex items-center gap-2" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}>
                <FiClock style={{color:'#4B5563'}} /> Historial
              </h2>

              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">💰</div>
                  <p className="text-gray-500 text-sm mb-4">Aún no tenés transacciones</p>
                  <Link href="/study-match" className="button-primary px-5 py-2 text-sm">
                    Encontrar compañeros
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((tx, i) => (
                  <div className="flex items-center gap-3 p-4 bg-white" style={{border:'2px solid #1C293C', borderRadius:'10px', boxShadow:'3px 3px 0 #1C293C', marginBottom:'8px', transition:'all 0.12s ease'}}>
                      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <img src="/images/santoken.png.png" alt="SanToken" className="w-10 h-10 object-contain" style={{mixBlendMode:'multiply'}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{color:'#1C293C'}}>{tx.description}</p>
                        <p className="text-xs" style={{color:'#4B5563'}}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                        </p>
                      </div>
                      <div className="font-black text-sm flex-shrink-0" style={{color:'#16a34a'}}>+{tx.amount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
