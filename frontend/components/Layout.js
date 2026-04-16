import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiPlusSquare, FiUser, FiLogOut, FiFolder, FiMenu, FiX, FiCpu } from 'react-icons/fi';
import { useState } from 'react';
import Image from 'next/image';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
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
                    // Fallback si la imagen no existe
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📚</span>
                </div>
              </div>
              <span className="hidden sm:inline text-xl font-bold text-secondary">
                StudyTree
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary transition-colors"
              >
                <FiHome className="w-5 h-5" />
                <span className="text-sm font-medium">Inicio</span>
              </Link>

              <Link 
                href="/tree" 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary transition-colors"
              >
                <FiFolder className="w-5 h-5" />
                <span className="text-sm font-medium">Mis favs</span>
              </Link>

              {user ? (
                <Link 
                  href="/ai" 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary transition-colors"
                >
                  <FiCpu className="w-5 h-5" />
                  <span className="text-sm font-medium">Recomendación IA</span>
                </Link>
              ) : null}

              {user ? (
                <>
                  <Link 
                    href="/upload" 
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-secondary transition-colors"
                  >
                    <FiPlusSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">Subir</span>
                  </Link>

                  <div className="w-px h-6 bg-gray-200"></div>

                  <Link 
                    href={`/user/${user.id}`}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green-50 text-primary transition-colors"
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
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="text-sm font-medium hidden lg:inline">Salir</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-2 items-center h-10">
                  <Link 
                    href="/login" 
                    className="px-4 py-0 h-full flex items-center text-primary font-medium hover:bg-green-50 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="button-primary px-4 py-0 h-full flex items-center font-medium rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-50"
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
            <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
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
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-center text-muted text-sm">
            © 2024 StudyTree - Compartiendo apuntes 📚
          </p>
        </div>
      </footer>
    </div>
  );
}