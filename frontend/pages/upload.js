import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

const CATEGORIES = [
  'Matemática', 'Física', 'Química', 'Biología', 
  'Programación', 'Economía', 'Historia', 'Literatura', 'Otros'
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    if (!title) {
      setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ''));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !category) {
      setError('Completa los campos requeridos');
      return;
    }
    
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    
    try {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto card text-center py-12 border border-gray-100">
          <p className="text-muted">Debes iniciar sesión para subir archivos.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="badge-success">Publicación de recursos</span>
        </div>
        <h1 className="title text-3xl mb-2">Subir material</h1>
        <p className="text-muted mb-6">Comparte apuntes y recursos con toda la comunidad.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 card border border-gray-100">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <FiFile className="w-8 h-8 text-primary" />
                <span className="font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <FiUploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">
                  {isDragActive ? 'Suelta el archivo' : 'Arrastra un archivo o haz click para seleccionar'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  PDF, Word, PowerPoint, Excel, imágenes (max 50MB)
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (separados por coma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="integral, derivadas, examen final"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={uploading || !file}
            className="button-primary w-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Subiendo...' : 'Publicar'}
          </button>
        </form>
      </div>
    </Layout>
  );
}