import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Layout from '../../components/Layout';
import ResourceCard from '../../components/ResourceCard';
import { useAuth } from '../../context/AuthContext';
import { FiUserPlus, FiUserCheck, FiFile, FiEdit3 } from 'react-icons/fi';
import Link from 'next/link';

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
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white border-4 border-primary shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl sm:text-5xl font-bold text-primary">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="title text-2xl sm:text-3xl">
                @{profile.username}
              </h1>
              {profile.bio && (
                <p className="text-muted mt-2 text-sm sm:text-base">{profile.bio}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Unido desde {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="w-full sm:w-auto flex flex-col gap-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {resources.length}
                </div>
                <div className="text-xs text-gray-600">Apuntes</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {followersCount}
                </div>
                <div className="text-xs text-gray-600">Seguidores</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {followingCount}
                </div>
                <div className="text-xs text-gray-600">Siguiendo</div>
              </div>
            </div>

            {/* Buttons */}
            {isOwnProfile ? (
              <Link
                href="/edit-profile"
                className="button-primary flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-medium transition-all"
              >
                <FiEdit3 className="w-4 h-4" />
                Editar perfil
              </Link>
            ) : currentUser ? (
              <button
                onClick={handleFollow}
                className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  isFollowing
                    ? 'border-2 border-primary text-primary hover:bg-green-50'
                    : 'button-primary text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <FiUserCheck className="w-4 h-4" />
                    <span>Siguiendo</span>
                  </>
                ) : (
                  <>
                    <FiUserPlus className="w-4 h-4" />
                    <span>Seguir</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div>
        <h2 className="title text-2xl mb-6">
          Material académico
        </h2>

        {resources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FiFile className="w-12 h-12 mx-auto text-gray-300" />
            <p className="text-gray-500 mt-3">
              {isOwnProfile
                ? 'Aún no has subido material.'
                : 'Este usuario no ha subido material todavía.'}
            </p>
            {isOwnProfile && (
              <Link
                href="/upload"
                className="button-primary mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
              >
                <FiFile className="w-4 h-4" />
                Subir material
              </Link>
            )}
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