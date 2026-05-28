import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import { FiMessageCircle, FiUsers } from 'react-icons/fi';

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function Chats() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/chat/conversations')
      .then(res => setConversations(res.data))
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
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiMessageCircle className="text-primary" /> Chats
            </h1>
            <p className="text-sm text-gray-500">{conversations.length} conversaciones</p>
          </div>
          <Link href="/matches" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-primary text-sm font-medium hover:bg-green-100 transition-all">
            <FiUsers className="w-4 h-4" /> Ver matches
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Sin chats aún</h3>
            <p className="text-gray-500 text-sm mb-6">Hacé un match con alguien para empezar a chatear</p>
            <Link href="/study-match" className="button-primary px-6 py-2">
              Encontrar compañeros
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <Link
                key={conv.roomId}
                href={`/chat/${conv.other._id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                    {conv.other.avatar ? (
                      <img src={`http://localhost:5000${conv.other.avatar}`} alt={conv.other.username} className="w-full h-full object-cover" />
                    ) : (
                      conv.other.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {conv.unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`font-semibold ${conv.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {conv.other.username}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(conv.lastAt)}</span>
                  </div>
                  <p className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
