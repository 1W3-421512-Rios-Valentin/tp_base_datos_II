import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FiHome, FiPlusSquare, FiUser, FiLogOut, FiFolder, FiMenu, FiX, FiCpu, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../lib/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar conteo desde API (al montar y al cambiar de ruta)
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    api.get('/chat/unread')
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [user, router.pathname]);

  // Incrementar en tiempo real al recibir mensaje (solo si no estás en la pantalla de chat)
  useEffect(() => {
    if (!socket) return;
    const onMessage = () => {
      if (!router.pathname.startsWith('/chat')) {
        setUnreadCount(prev => prev + 1);
      }
    };
    socket.on('receive_message', onMessage);
    return () => socket.off('receive_message', onMessage);
  }, [socket, router.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-surface sticky top-0 z-40" style={{background:'#FBFBF9', borderBottom:'2px solid #1C293C', boxShadow:'0 4px 0 #1C293C'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/studytree-logo.png"
                  alt="StudyTree"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📚</span>
                </div>
              </div>
              <span className="hidden sm:inline text-xl font-bold" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif', fontWeight:900, letterSpacing:'-0.02em'}}>
                StudyTree
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/"
                className="flex items-center space-x-2 px-3 py-2 transition-all"
                style={{color:'#1C293C', fontWeight:600, borderRadius:'8px'}}
                onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
              >
                <FiHome className="w-5 h-5" />
                <span className="text-sm font-medium">Inicio</span>
              </Link>

              <Link
                href="/tree"
                className="flex items-center space-x-2 px-3 py-2 transition-all"
                style={{color:'#1C293C', fontWeight:600, borderRadius:'8px'}}
                onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
              >
                <FiFolder className="w-5 h-5" />
                <span className="text-sm font-medium">Mis favs</span>
              </Link>

              {user ? (
                <Link
                  href="/ai"
                  className="flex items-center space-x-2 px-3 py-2 transition-all"
                  style={{color:'#1C293C', fontWeight:600, borderRadius:'8px'}}
                  onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                  onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
                >
                  <FiCpu className="w-5 h-5" />
                  <span className="text-sm font-medium">Recomendación IA</span>
                </Link>
              ) : null}

              {user ? (
                <>
                  <Link
                    href="/study-match"
                    className="flex items-center space-x-2 px-3 py-2 transition-all"
                    style={{color:'#1C293C', fontWeight:600, borderRadius:'8px'}}
                    onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
                  >
                    <FiHeart className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Study Match</span>
                  </Link>

                  <Link
                    href="/chats"
                    className="flex items-center space-x-2 px-3 py-2 transition-all"
                    style={{color:'#1C293C', fontWeight:600, borderRadius:'8px'}}
                    onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
                  >
                    <div className="relative">
                      <FiMessageCircle className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">Chats</span>
                  </Link>

                  <Link
                    href="/wallet"
                    className="flex items-center space-x-2 px-3 py-2 transition-all"
                    style={{color:'#1C293C', fontWeight:600, borderRadius:'8px'}}
                    onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
                  >
                    <img src="/images/santoken.png.png" alt="Wallet" className="w-5 h-5 object-contain" style={{mixBlendMode:'multiply'}} />
                    <span className="text-sm font-medium hidden lg:inline">Wallet</span>
                  </Link>

                  <Link
                    href="/upload"
                    className="flex items-center space-x-2 px-3 py-2 transition-all"
                    style={{color:'#1C293C', fontWeight:600, borderRadius:'8px'}}
                    onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
                  >
                    <FiPlusSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">Subir</span>
                  </Link>

                  <div className="w-px h-6" style={{background:'#1C293C'}}></div>

                  <Link
                    href={`/user/${user.id}`}
                    className="flex items-center space-x-2 px-3 py-2 transition-all"
                    style={{color:'#4CAF50', fontWeight:700, borderRadius:'8px'}}
                    onMouseEnter={e => { e.currentTarget.style.background='#dcfce7'; e.currentTarget.style.outline='2px solid #1C293C'; }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
                  >
                    {user.avatar && user.avatar.startsWith('/uploads/') ? (
                      <img
                        src={`http://localhost:5000${user.avatar}`}
                        alt={user.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium hidden lg:inline">
                      {user.username}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 transition-all"
                    style={{color:'#dc2626', fontWeight:600, borderRadius:'8px', background:'transparent', border:'none', cursor:'pointer'}}
                    onMouseEnter={e => { e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.outline='2px solid #dc2626'; }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.outline=''; }}
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="text-sm font-medium hidden lg:inline">Salir</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2 items-center h-10">
                  <Link
                    href="/login"
                    className="px-4 py-0 h-full flex items-center font-bold transition-all"
                    style={{color:'#4CAF50', border:'2px solid transparent', borderRadius:'8px'}}
                    onMouseEnter={e => { e.currentTarget.style.border='2px solid #1C293C'; e.currentTarget.style.background='#dcfce7'; }}
                    onMouseLeave={e => { e.currentTarget.style.border='2px solid transparent'; e.currentTarget.style.background=''; }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="button-primary px-4 py-0 h-full flex items-center"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 transition-all"
              style={{borderRadius:'8px', border:'2px solid transparent', background:'transparent', cursor:'pointer'}}
              onMouseEnter={e => { e.currentTarget.style.border='2px solid #1C293C'; e.currentTarget.style.background='#dcfce7'; }}
              onMouseLeave={e => { e.currentTarget.style.border='2px solid transparent'; e.currentTarget.style.background=''; }}
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2" style={{borderTop:'2px solid #1C293C'}}>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary w-full"
              >
                <FiHome className="w-5 h-5" />
                <span>Inicio</span>
              </Link>

              <Link
                href="/tree"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary w-full"
              >
                <FiFolder className="w-5 h-5" />
                <span>Mis favs</span>
              </Link>

              {user ? (
                <Link
                  href="/ai"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary w-full"
                >
                  <FiCpu className="w-5 h-5" />
                  <span>Recomendación IA</span>
                </Link>
              ) : null}

              {user ? (
                <>
                  <Link
                    href="/study-match"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green-50 text-secondary w-full"
                  >
                    <FiHeart className="w-5 h-5 text-primary" />
                    <span>Study Match</span>
                  </Link>

                  <Link
                    href="/chats"
                    onClick={() => { setMobileMenuOpen(false); setUnreadCount(0); }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary w-full"
                  >
                    <div className="relative">
                      <FiMessageCircle className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span>Chats</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-yellow-50 text-secondary w-full"
                  >
                    <img src="/images/santoken.png.png" alt="SanToken" className="w-5 h-5 object-contain" style={{mixBlendMode:'multiply'}} />
                    <span>Wallet SanTokens</span>
                  </Link>

                  <Link
                    href="/upload"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary w-full"
                  >
                    <FiPlusSquare className="w-5 h-5" />
                    <span>Subir material</span>
                  </Link>

                  <div className="h-px bg-gray-200 my-2"></div>

                  <Link
                    href={`/user/${user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green-50 text-primary w-full"
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Mi perfil</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 w-full"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-2 text-primary font-medium text-center hover:bg-green-50 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="button-primary flex-1 px-4 py-2 font-medium text-center rounded-lg"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 page-enter">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-12" style={{background:'#FBFBF9', borderTop:'2px solid #1C293C', boxShadow:'0 -4px 0 #1C293C'}}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-center text-sm font-bold" style={{color:'#1C293C'}}>
            © 2024 StudyTree — Compartiendo apuntes 📚
          </p>
        </div>
      </footer>
    </div>
  );
}
