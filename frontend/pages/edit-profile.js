import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { FiArrowLeft, FiUploadCloud, FiX, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

const STUDY_YEARS = ['1er año', '2do año', '3er año', '4to año', '5to año', '6to año'];

const LANGUAGE_OPTIONS = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Italiano'];

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = (value) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div style={{border:'2px solid #1C293C', borderRadius:'10px', padding:'8px 12px'}}
      className={`focus-within:border-primary focus-within:shadow-[3px_3px_0_#4CAF50]`}
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-sm font-bold" style={{background:'#dcfce7', color:'#16a34a', border:'1.5px solid #16a34a', borderRadius:'999px'}}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>
              <FiX className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder={placeholder}
        className="w-full text-sm"
        style={{outline:'none', border:'none', background:'transparent', color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}
      />
    </div>
  );
}

export default function EditProfile() {
  const router = useRouter();
  const { user, fetchUser } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  // Perfil de estudio
  const [studyYear, setStudyYear] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setAvatarPreview(user.avatar || '');
      setStudyYear(user.studyYear || '');
      setSubjects(user.subjects || []);
      setLanguages(user.languages || []);
      setLocation(user.location || { lat: null, lon: null });
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('La imagen debe ser menor a 5MB'); return; }
    if (!file.type.startsWith('image/')) { setError('El archivo debe ser una imagen'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => { setError('No se pudo obtener la ubicación'); setLocating(false); }
    );
  };

  const toggleLanguage = (lang) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = avatar;

      if (avatarFile) {
        const uploadRes = await fetch(`http://localhost:5000/api/users/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ avatar: avatarPreview })
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          avatarUrl = data.url;
        } else {
          throw new Error('Error al subir avatar');
        }
      }

      await api.put(`/users/${user.id}/profile`, {
        username,
        bio,
        avatar: avatarUrl,
        studyYear,
        subjects,
        languages,
        location
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
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm border border-green-200">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Foto de perfil</label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">{username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center p-6 cursor-pointer transition-all" style={{border:'2px dashed #1C293C', borderRadius:'10px', boxShadow:'3px 3px 0 #1C293C'}} onMouseEnter={e => {e.currentTarget.style.background='#dcfce7';e.currentTarget.style.borderColor='#4CAF50';}} onMouseLeave={e => {e.currentTarget.style.background='';e.currentTarget.style.borderColor='#1C293C';}}>
                    <FiUploadCloud className="w-8 h-8 mb-2" style={{color:'#4B5563'}} />
                    <span className="text-sm font-bold" style={{color:'#1C293C'}}>{avatarFile ? avatarFile.name : 'Sube una foto'}</span>
                    <span className="text-xs mt-1" style={{color:'#4B5563'}}>PNG, JPG hasta 5MB</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{color:'#1C293C'}}>Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3"
                style={{border:'2px solid #1C293C', borderRadius:'8px', background:'#FBFBF9', fontFamily:'Inter,Poppins,sans-serif', outline:'none'}}
                onFocus={e => { e.target.style.borderColor='#4CAF50'; e.target.style.boxShadow='3px 3px 0 #4CAF50'; }}
                onBlur={e => { e.target.style.borderColor='#1C293C'; e.target.style.boxShadow='none'; }}
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{color:'#1C293C'}}>Biografía</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder="Cuéntanos sobre ti... (máximo 160 caracteres)"
                className="w-full px-4 py-3"
                style={{border:'2px solid #1C293C', borderRadius:'8px', background:'#FBFBF9', fontFamily:'Inter,Poppins,sans-serif', outline:'none', resize:'none'}}
                onFocus={e => { e.target.style.borderColor='#4CAF50'; e.target.style.boxShadow='3px 3px 0 #4CAF50'; }}
                onBlur={e => { e.target.style.borderColor='#1C293C'; e.target.style.boxShadow='none'; }}
              />
              <p className="text-xs mt-1" style={{color:'#4B5563'}}>{bio.length}/160 caracteres</p>
            </div>

            {/* Divider */}
            <div className="pt-6" style={{borderTop:'2px solid #1C293C'}}>
              <h2 className="text-lg font-black mb-1" style={{color:'#1C293C', fontFamily:'Inter,Poppins,sans-serif'}}>Perfil de estudio</h2>
              <p className="text-sm mb-5" style={{color:'#4B5563'}}>Usado para encontrar compañeros de estudio compatibles</p>

              {/* Año de cursado */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Año de cursado</label>
                <div className="flex flex-wrap gap-2">
                  {STUDY_YEARS.map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setStudyYear(studyYear === year ? '' : year)}
                      className="px-4 py-2 text-sm font-bold transition-all"
                      style={studyYear === year
                        ? {background:'#4CAF50', color:'#fff', border:'2px solid #1C293C', borderRadius:'999px', boxShadow:'2px 2px 0 #1C293C'}
                        : {background:'#FBFBF9', color:'#1C293C', border:'2px solid #1C293C', borderRadius:'999px'}}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materias */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Materias que estudiás</label>
                <TagInput
                  tags={subjects}
                  onChange={setSubjects}
                  placeholder="Ej: Análisis Matemático, Física... (Enter para agregar)"
                />
              </div>

              {/* Idiomas */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Idiomas</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className="px-4 py-2 text-sm font-bold transition-all"
                      style={languages.includes(lang)
                        ? {background:'#4CAF50', color:'#fff', border:'2px solid #1C293C', borderRadius:'999px', boxShadow:'2px 2px 0 #1C293C'}
                        : {background:'#FBFBF9', color:'#1C293C', border:'2px solid #1C293C', borderRadius:'999px'}}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all disabled:opacity-50"
                    style={{border:'2px solid #1C293C', borderRadius:'8px', boxShadow:'2px 2px 0 #1C293C', background:'#FBFBF9', color:'#1C293C', cursor:'pointer'}}
                  >
                    <FiMapPin className="w-4 h-4" />
                    {locating ? 'Obteniendo...' : 'Usar mi ubicación actual'}
                  </button>
                  {location.lat && (
                    <span className="text-xs text-green-600 font-medium">
                      Ubicación guardada ({location.lat.toFixed(3)}, {location.lon.toFixed(3)})
                    </span>
                  )}
                </div>
              </div>
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
                className="flex-1 py-3 font-bold text-center transition-all"
                style={{background:'#FBFBF9', color:'#1C293C', border:'2px solid #1C293C', borderRadius:'10px', boxShadow:'3px 3px 0 #1C293C', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center'}}
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
