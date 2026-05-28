import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

export default function ChatPage() {
  const router = useRouter();
  const { userId: targetId } = router.query;
  const { user } = useAuth();
  const { socket } = useSocket();

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cargar historial y datos del otro usuario
  useEffect(() => {
    if (!targetId || !user) return;

    Promise.all([
      api.get(`/users/${targetId}`),
      api.get(`/chat/${targetId}`)
    ]).then(([userRes, msgRes]) => {
      setOtherUser(userRes.data.user);
      setMessages(msgRes.data);
    }).catch(err => {
      if (err.response?.status === 403) router.push('/matches');
    }).finally(() => setLoading(false));
  }, [targetId, user]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Socket events
  useEffect(() => {
    if (!socket || !targetId) return;

    socket.emit('join_room', { targetUserId: targetId });

    const onMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const onTyping = ({ isTyping: typing }) => {
      setIsTyping(typing);
    };

    socket.on('receive_message', onMessage);
    socket.on('user_typing', onTyping);

    return () => {
      socket.off('receive_message', onMessage);
      socket.off('user_typing', onTyping);
    };
  }, [socket, targetId]);

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit('typing', { targetUserId: targetId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { targetUserId: targetId, isTyping: false });
    }, 1500);
  };

  const sendMessage = useCallback(async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending || !socket) return;
    setSending(true);
    socket.emit('send_message', { targetUserId: targetId, text: text.trim() });
    socket.emit('typing', { targetUserId: targetId, isTyping: false });
    setText('');
    setSending(false);
  }, [text, sending, socket, targetId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // Agrupar mensajes por fecha
  let lastDate = null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <Link href="/chats" className="p-2 transition-all" style={{borderRadius:'8px', border:'2px solid transparent', color:'#1C293C'}} onMouseEnter={e=>{e.currentTarget.style.border='2px solid #1C293C';e.currentTarget.style.background='#dcfce7';}} onMouseLeave={e=>{e.currentTarget.style.border='2px solid transparent';e.currentTarget.style.background='';}}>
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
            {otherUser?.avatar ? (
              <img src={`http://localhost:5000${otherUser.avatar}`} alt={otherUser.username} className="w-full h-full object-cover" />
            ) : (
              otherUser?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-bold" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}>{otherUser?.username}</p>
            {otherUser?.studyYear && <p className="text-xs text-gray-400">{otherUser.studyYear}</p>}
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto space-y-1 py-2 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Hola 👋 ¡Empezá la conversación!
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.sender._id === user.id || msg.sender._id?.toString() === user.id;
            const msgDate = formatDate(msg.createdAt);
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;

            return (
              <div key={msg._id || i}>
                {showDate && (
                  <div className="text-center my-3">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msgDate}</span>
                  </div>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2 text-sm`}
                    style={isMe
                      ? {background:'#4CAF50', color:'#fff', border:'2px solid #1C293C', borderRadius:'14px 14px 4px 14px', boxShadow:'2px 2px 0 #1C293C'}
                      : {background:'#FBFBF9', color:'#1C293C', border:'2px solid #1C293C', borderRadius:'14px 14px 14px 4px', boxShadow:'2px 2px 0 #1C293C'}}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
            <p className={`text-[10px] mt-1 text-right`} style={{color: isMe ? 'rgba(255,255,255,0.7)' : '#9CA3AF'}}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-2 pt-3 flex-shrink-0">
          <textarea
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Escribí un mensaje... (Enter para enviar)"
            rows={1}
            className="flex-1 px-4 py-3 resize-none text-sm"
            style={{border:'2px solid #1C293C', borderRadius:'10px', background:'#FBFBF9', fontFamily:'Inter,Poppins,sans-serif', outline:'none'}}
            onFocus={e => { e.target.style.borderColor='#4CAF50'; e.target.style.boxShadow='3px 3px 0 #4CAF50'; }}
            onBlur={e => { e.target.style.borderColor='#1C293C'; e.target.style.boxShadow='none'; }}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="px-4 py-3 flex items-center gap-1.5 font-bold transition-all disabled:opacity-40"
            style={{background:'#4CAF50', color:'#fff', border:'2px solid #1C293C', borderRadius:'10px', boxShadow:'3px 3px 0 #1C293C', cursor:'pointer'}}
            onMouseEnter={e => { if(!e.currentTarget.disabled) { e.currentTarget.style.transform='translate(-1px,-1px)'; e.currentTarget.style.boxShadow='4px 4px 0 #1C293C'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='3px 3px 0 #1C293C'; }}
          >
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Layout>
  );
}
