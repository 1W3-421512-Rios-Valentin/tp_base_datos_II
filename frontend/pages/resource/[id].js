import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import api from '../../lib/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { FiHeart, FiEye, FiMessageCircle, FiDownload, FiArrowLeft, FiX, FiCornerDownRight } from 'react-icons/fi';
import Link from 'next/link';

// Importar react-pdf dinámicamente solo en el cliente
const PDFViewer = dynamic(() => import('../../components/PDFViewer'), {
  ssr: false,
  loading: () => <div className="text-gray-500">Cargando PDF...</div>
});

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
  const [hasViewed, setHasViewed] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Cargar PDF cuando el recurso esté disponible
  useEffect(() => {
    if (resource && resource.fileType === 'application/pdf') {
      const loadPdf = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/resources/${id}/file`);
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setPdfBlob(blobUrl);
          }
        } catch (err) {
          console.error('Error loading PDF:', err);
        }
      };
      loadPdf();
    }
  }, [resource, id]);

  useEffect(() => {
    if (id && !hasViewed) {
      setHasViewed(true);
      fetchResource();
    }
  }, [id, hasViewed]);

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
      console.log('Comments:', res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
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

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !replyingTo) return;
    try {
      const response = await api.post(`/resources/${id}/comments/${replyingTo}/reply`, { text: replyText });
      console.log('Reply created:', response.data);
      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (err) {
      console.error('Error creating reply:', err);
      alert('Error al enviar la respuesta');
    }
  };

  const downloadFile = () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/resources/${resource._id}/file`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.fileName || 'archivo';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => console.error('Error descargando:', err));
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
      <Link href="/" className="inline-flex items-center text-muted hover:text-secondary mb-4">
        <FiArrowLeft className="w-4 h-4 mr-1" />
        Volver
      </Link>

      <div className="card border border-gray-100">
        <h1 className="title text-2xl">{resource.title}</h1>
        
        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
          <span>@{resource.user?.username}</span>
          <span>•</span>
          <span>{resource.category}</span>
          <span>•</span>
          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
        </div>

        {resource.description && (
          <p className="mt-4 text-muted">{resource.description}</p>
        )}

        {/* Preview del documento */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Previsualización del documento</p>
          {resource.fileType === 'application/pdf' && pdfBlob ? (
            <PDFViewer 
              fileUrl={pdfBlob}
              fileName={resource.fileName}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              numPages={numPages}
            />
          ) : resource.fileType === 'application/pdf' && !pdfBlob ? (
            <div className="bg-white rounded border border-gray-300 p-4 h-64 overflow-y-auto flex items-center justify-center">
              <div className="text-gray-500 text-sm">Cargando PDF...</div>
            </div>
          ) : (
            <div className="bg-white rounded border border-gray-300 p-4 h-64 overflow-y-auto flex items-center justify-center">
              <div className="text-center">
                <FiDownload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">{resource.fileName || 'Documento'}</p>
                <p className="text-gray-400 text-xs mt-2">Descarga el archivo para ver su contenido completo</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${liked ? 'text-primary' : 'text-gray-500'}`}
            >
              <FiHeart className={liked ? 'fill-current' : ''} />
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-500">
              <FiEye />
              <span>{resource.views}</span>
            </div>
            <button 
              onClick={() => setShowCommentsModal(true)}
              className="flex items-center space-x-2 text-gray-500 hover:text-secondary transition-colors"
            >
              <FiMessageCircle />
              <span>{resource.commentsCount}</span>
            </button>
          </div>
          
          <button
            onClick={downloadFile}
            className="button-primary flex items-center space-x-2 px-4 py-2 rounded-lg"
          >
            <FiDownload />
            <span>Descargar</span>
          </button>
        </div>
      </div>

      {/* Modal de comentarios */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="title text-lg">Comentarios ({comments.length})</h2>
              <button
                onClick={() => {
                  setShowCommentsModal(false);
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Body - Comentarios */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay comentarios todavía.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                    {/* Comentario principal */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">@{comment.user?.username}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{comment.text}</p>
                      {user && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          className="mt-2 text-xs text-primary hover:text-green-700 flex items-center space-x-1 transition-colors"
                        >
                          <FiCornerDownRight className="w-3 h-3" />
                          <span>Responder</span>
                        </button>
                      )}
                    </div>

                    {/* Respuestas anidadas */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-4 space-y-3 border-l-2 border-primary pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">@{reply.user?.username}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-600">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulario de respuesta */}
                    {replyingTo === comment._id && user && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleReply(e);
                        }} 
                        className="mt-3 flex items-center space-x-2 bg-gray-50 p-3 rounded"
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe una respuesta..."
                          className="flex-1 px-3 py-2 text-sm rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="button-primary px-3 py-2 text-sm rounded font-medium"
                        >
                          Enviar
                        </button>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer - Nuevo comentario */}
            {user && (
              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleComment} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="button-primary px-4 py-2 rounded-lg font-medium flex items-center"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}