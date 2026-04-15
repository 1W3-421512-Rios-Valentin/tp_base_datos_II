import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Layout from '../../components/Layout';
import ResourceCard from '../../components/ResourceCard';
import { useAuth } from '../../context/AuthContext';
import { FiUserPlus, FiUserCheck, FiFile } from 'react-icons/fi';

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setProfile(res.data.user);
      setFollowersCount(res.data.user.followers?.length || 0);
      setFollowingCount(res.data.user.following?.length || 0);
      
      if (currentUser && res.data.user.followers?.includes(currentUser.id)) {
        setIsFollowing(true);
      }
      
      const resourcesRes = await api.get(`/users/${id}/resources`);
      setResources(resourcesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !id) return;
    try {
      const res = await api.post(`/users/${id}/follow`);
      setIsFollowing(res.data.isFollowing);
      setFollowersCount(res.data.followers);
    } catch (err) {
      console.error(err);
    }
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

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Usuario no encontrado</p>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.id === id;

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-500">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">@{profile.username}</h1>
              {profile.bio && <p className="text-gray-500 mt-1">{profile.bio}</p>}
              <div className="flex items-center space-x-4 mt-3 text-sm">
                <div>
                  <span className="font-semibold">{resources.length}</span>
                  <span className="text-gray-500 ml-1">apuntes</span>
                </div>
                <div>
                  <span className="font-semibold">{followersCount}</span>
                  <span className="text-gray-500 ml-1">seguidores</span>
                </div>
                <div>
                  <span className="font-semibold">{followingCount}</span>
                  <span className="text-gray-500 ml-1">siguiendo</span>
                </div>
              </div>
            </div>
          </div>
          
          {!isOwnProfile && currentUser && (
            <button
              onClick={handleFollow}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                isFollowing
                  ? 'border border-gray-300 text-gray-700'
                  : 'bg-primary text-white hover:bg-indigo-600'
              }`}
            >
              {isFollowing ? (
                <>
                  <FiUserCheck />
                  <span>Siguiendo</span>
                </>
              ) : (
                <>
                  <FiUserPlus />
                  <span>Seguir</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Material subido</h2>
        
        {resources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FiFile className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-gray-500 mt-3">Este usuario no ha subido material todavía.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}