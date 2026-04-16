import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { FiArrowLeft, FiUploadCloud, FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function EditProfile() {
  const router = useRouter();
  const { user, fetchUser } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = avatar;

      if (avatarFile) {
        // Enviar avatar en base64
        try {
          const uploadRes = await fetch(
            `http://localhost:5000/api/users/upload`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ avatar: avatarPreview })
            }
          );
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            avatarUrl = data.url;
          } else {
            throw new Error('Error al subir avatar');
          }
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          setError('Error al subir la imagen');
          setSaving(false);
          return;
        }
      }

      await api.put(`/users/${user.id}/profile`, {
        username,
        bio,
        avatar: avatarUrl
      });

      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => {
        fetchUser();
        router.push(`/user/${user.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Debes iniciar sesión</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link href={`/user/${user.id}`} className="inline-flex items-center text-muted hover:text-secondary mb-6">
        <FiArrowLeft className="w-4 h-4 mr-2" />
        Volver al perfil
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="card border border-gray-100">
          <div className="mb-6">
            <span className="badge-success">Perfil académico</span>
          </div>
          <h1 className="title text-3xl mb-8">Editar perfil</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm border border-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Foto de perfil
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-green-50 transition-all">
                    <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">
                      {avatarFile ? avatarFile.name : 'Sube una foto'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG hasta 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={4}
                placeholder="Cuéntanos sobre ti... (máximo 160 caracteres)"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {bio.length}/160 caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="button-primary flex-1 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <Link
                href={`/user/${user.id}`}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 text-center transition-all"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
