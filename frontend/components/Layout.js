import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiPlusSquare, FiUser, FiLogOut, FiFolder } from 'react-icons/fi';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                StudyTree
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 rounded-lg hover:bg-gray-100">
                <FiHome className="w-5 h-5" />
              </Link>
              <Link href="/tree" className="p-2 rounded-lg hover:bg-gray-100">
                <FiFolder className="w-5 h-5" />
              </Link>
              {user ? (
                <>
                  <Link href="/upload" className="p-2 rounded-lg hover:bg-gray-100">
                    <FiPlusSquare className="w-5 h-5" />
                  </Link>
                  <Link href={`/user/${user.id}`} className="p-2 rounded-lg hover:bg-gray-100">
                    <FiUser className="w-5 h-5" />
                  </Link>
                  <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 text-red-500">
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}