# StudyTree - Plataforma de Material Académico

Una aplicación web para compartir material de estudio (apuntes, ejercicios, presentaciones) tipo Instagram, conectada a MongoDB Atlas.

## 🚀 Características

- 📚 Subir archivos: PDF, Word, PowerPoint, Excel, imágenes
- 🌲 Árbol de estudio por categorías
- ❤️ Likes, 💬 comentarios, 👁️ vistas
- 👥 Sistema de follows
- 🔐 Registro/login con usuario y contraseña

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Next.js + Tailwind CSS
- **DB:** MongoDB Atlas (GridFS para archivos)
- **Auth:** JWT

## 📋 Requisitos

- Node.js 18+
- Cuenta en MongoDB Atlas
- Git

## ⚡ Configuración Local

### 1. Clonar el proyecto
```bash
git clone https://github.com/TU_USUARIO/studytree-app.git
cd studytree-app
```

### 2. Configurar MongoDB Atlas
1. Ir a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear cluster gratuito
3. En **Network Access**, agregar IP: `0.0.0.0/0`
4. **Connect** → **Drivers** → Copiar connection string

### 3. Backend
```bash
# Instalar dependencias
npm install

# Copiar y configurar variables
copy .env.example .env
# Editar .env con tu MONGO_URI

# Arrancar
node server.js
```
Backend corre en: http://localhost:5000

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend corre en: http://localhost:3000

## 📁 Estructura

```
studytree-app/
├── server.js           # Entry point backend
├── .env             # Variables de entorno
├── models/           # Modelos Mongoose
│   ├── User.js
│   ├── Resource.js
│   └── Comment.js
├── routes/           # Endpoints API
│   ├── auth.js
│   ├── resources.js
│   └── users.js
├── middleware/       # Auth middleware
└── frontend/        # Next.js app
    ├── pages/       # Rutas
    ├── components/  # Componentes
    ├── context/    # Auth context
    └── lib/        # API client
```

## 🔌 API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|------------|
| POST | /api/auth/register | Registrarse |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Usuario actual |

### Recursos
| Método | Ruta | Descripción |
|--------|------|------------|
| GET | /api/resources | Listar recursos |
| POST | /api/resources | Subir archivo |
| GET | /api/resources/:id | Ver recurso |
| GET | /api/resources/:id/file | Descargar archivo |
| POST | /api/resources/:id/like | Like/unlike |
| POST | /api/resources/:id/comment | Comentar |
| GET | /api/resources/:id/comments | Ver comentarios |
| GET | /api/resources/tree | Árbol de recursos |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|------------|
| GET | /api/users/:id | Perfil |
| GET | /api/users/:id/resources | Recursos del usuario |
| POST | /api/users/:id/follow | Follow/unfollow |

## 🔧 Modificaciones Comunes

### Cambiar puerto backend
Editar `server.js` línea ~24:
```javascript
const PORT = 3000; // Cambiar aquí
```

### Agregar categorías
Editar `frontend/pages/upload.js` línea ~11:
```javascript
const CATEGORIES = ['NuevaCategoria', ...];
```

### Agregar tipos de archivo
Editar `backend/routes/resources.js` línea ~20:
```javascript
const FILE_TYPES = ['application/nuevo-tipo', ...];
```

## 📝 Licencia

MIT