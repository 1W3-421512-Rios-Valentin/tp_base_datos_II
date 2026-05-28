import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { FiHeart, FiEye, FiMessageCircle, FiFile, FiImage, FiFileText, FiDownload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <FiImage className="w-8 h-8 text-emerald-500" />;
  if (type.includes('pdf')) return <FiFileText className="w-8 h-8 text-red-500" />;
  if (type.includes('word') || type.includes('document')) return <FiFileText className="w-8 h-8 text-blue-500" />;
  return <FiFile className="w-8 h-8 text-indigo-500" />;
};

const getCategoryColor = (category) => {
  const colors = {
    'Matemáticas': 'bg-blue-100 text-secondary',
    'Física': 'bg-blue-100 text-secondary',
    'Química': 'bg-green-100 text-primary',
    'Historia': 'bg-green-100 text-primary',
    'Literatura': 'bg-blue-100 text-secondary',
    'Programación': 'bg-green-100 text-primary',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export default function ResourceCard({ resource }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(resource.likes?.length || 0);

  useEffect(() => {
    if (user && resource.likes?.includes(user.id)) {
      setLiked(true);
    }
  }, [user, resource.likes]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      const res = await api.post(`/resources/${resource._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link href={`/resource/${resource._id}`}>
      <div className="card p-4 transition-all duration-150 cursor-pointer" style={{}} onMouseEnter={e => { e.currentTarget.style.transform='translate(-2px,-2px)'; e.currentTarget.style.boxShadow='6px 6px 0 #1C293C'; }} onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='4px 4px 0 #1C293C'; }}>
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center" style={{background:'#FBFBF9', border:'2px solid #1C293C', borderRadius:'10px', boxShadow:'2px 2px 0 #1C293C'}}>
            {getFileIcon(resource.fileType)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-bold truncate text-sm sm:text-base" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}>
                  {resource.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted truncate mt-1">
                  {resource.description}
                </p>
              </div>
              
              {/* Download Icon */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiDownload className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Author */}
              {resource.user && (
                <Link href={`/user/${resource.user._id}`} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 transition-colors" style={{background:'#dcfce7', border:'1.5px solid #16a34a', borderRadius:'999px'}}>
                    <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {resource.user.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs font-medium text-primary hover:text-green-700">
                      @{resource.user.username}
                    </span>
                  </div>
                </Link>
              )}

              {/* Category */}
              <span className="text-xs font-bold px-2.5 py-1" style={{background:'#dcfce7', color:'#16a34a', border:'1.5px solid #16a34a', borderRadius:'999px'}}>
                {resource.category}
              </span>

              {/* Date */}
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(resource.createdAt).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="flex items-center justify-between mt-4 pt-3" style={{borderTop:'2px solid #1C293C'}}>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                liked 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              <FiHeart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiMessageCircle className="w-4 h-4" />
              <span>{resource.commentsCount || 0}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiEye className="w-4 h-4" />
              <span>{resource.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}