import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { FiHeart, FiEye, FiMessageCircle, FiDownload, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function ResourceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const res = await api.get(`/resources/${id}`);
      setResource(res.data);
      setLikesCount(res.data.likes?.length || 0);
      if (user && res.data.likes?.includes(user.id)) setLiked(true);
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/resources/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await api.post(`/resources/${id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      await api.post(`/resources/${id}/comment`, { text: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadFile = () => {
    window.open(`http://localhost:5000/api/resources/${resource.fileUrl}/file`, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!resource) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Recurso no encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
        <FiArrowLeft className="w-4 h-4 mr-1" />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
        
        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
          <span>@{resource.user?.username}</span>
          <span>•</span>
          <span>{resource.category}</span>
          <span>•</span>
          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
        </div>

        {resource.description && (
          <p className="mt-4 text-gray-600">{resource.description}</p>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <FiHeart className={liked ? 'fill-current' : ''} />
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-500">
              <FiEye />
              <span>{resource.views}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <FiMessageCircle />
              <span>{resource.commentsCount}</span>
            </div>
          </div>
          
          <button
            onClick={downloadFile}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600"
          >
            <FiDownload />
            <span>Descargar</span>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comentarios</h2>
        
        {user && (
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600"
              >
                Enviar
              </button>
            </div>
          </form>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay comentarios todavía.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">@{comment.user?.username}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}