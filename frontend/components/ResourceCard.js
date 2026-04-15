import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { FiHeart, FiEye, FiMessageCircle, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <FiImage className="text-green-500" />;
  if (type.includes('pdf')) return <FiFileText className="text-red-500" />;
  return <FiFile className="text-blue-500" />;
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 card-hover">
        <div className="flex items-start space-x-3">
          <div className="file-icon bg-gray-50">
            {getFileIcon(resource.fileType)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{resource.title}</h3>
            <p className="text-sm text-gray-500 truncate">{resource.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              {resource.user ? (
                <span className="text-xs text-gray-400">@{resource.user.username}</span>
              ) : null}
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{resource.category}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm ${liked ? 'text-red-500' : 'text-gray-400'}`}
            >
              <FiHeart className={liked ? 'fill-current' : ''} />
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <FiMessageCircle />
              <span>{resource.commentsCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <FiEye />
              <span>{resource.views || 0}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}