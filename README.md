# Florka SaaS Platform

Plataforma SaaS completa con sistema de autenticación, gestión de proyectos y foro de usuarios.

## 🚀 Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler
- **Zustand** para gestión de estado
- **Tailwind CSS** para estilos
- **React Router** para navegación

### Backend
- **Node.js** con TypeScript
- **Express.js** como framework
- **Prisma** como ORM
- **PostgreSQL** como base de datos
- **JWT** para autenticación

### DevOps
- **Docker** y **Docker Compose**
- **ESLint** y **Prettier**
- **Jest** y **Vitest** para testing

## 🏗️ Arquitectura

```
florka-saas-platform/
├── backend/                 # API REST con Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Middleware personalizado
│   │   ├── routes/          # Definición de rutas
│   │   ├── utils/           # Utilidades y helpers
│   │   └── app.ts          # Configuración de Express
│   ├── prisma/             # Esquemas y migraciones
│   └── Dockerfile
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── stores/         # Estado global con Zustand
│   │   ├── services/       # Servicios API
│   │   └── utils/          # Utilidades
│   └── Dockerfile
└── docker-compose.yml      # Orquestación de servicios
```

## 🔐 Funcionalidades de Autenticación

✅ **Registro de usuarios** - Validación completa y hasheo seguro
✅ **Inicio de sesión** - JWT con refresh tokens
✅ **Cierre de sesión** - Invalidación segura de sesiones
✅ **Protección de rutas** - Middleware en backend y frontend
✅ **Gestión de roles** - USER, ADMIN, SUPER_ADMIN
✅ **Renovación automática** - Refresh tokens transparente

## 🛡️ Seguridad

- Contraseñas hasheadas con **bcrypt** (12 rounds)
- Validación exhaustiva con **Joi**
- Headers de seguridad **OWASP**
- **Rate limiting** para prevenir ataques
- Variables de entorno para configuraciones sensibles
- **CORS** configurado correctamente

## 🚀 Instalación y Uso

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- PostgreSQL (si no usas Docker)

### Instalación Rápida con Docker

1. **Clonar el repositorio**
```bash
git clone https://github.com/Herocku2/florka-saas-platform.git
cd florka-saas-platform
```

2. **Configurar variables de entorno**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones
```

3. **Levantar todos los servicios**
```bash
docker-compose up -d
```

4. **Verificar que todo funciona**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health
- Adminer (DB): http://localhost:8080

### Desarrollo Local

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📋 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/profile` - Perfil del usuario
- `POST /api/auth/refresh` - Renovar token

### Proyectos
- `GET /api/projects` - Listar proyectos
- `GET /api/projects/:id` - Obtener proyecto
- `POST /api/projects` - Crear proyecto (Admin)
- `PUT /api/projects/:id` - Actualizar proyecto (Admin)
- `DELETE /api/projects/:id` - Eliminar proyecto (Admin)

### Administración
- `GET /api/admin/stats` - Estadísticas del sistema
- `GET /api/admin/users` - Gestión de usuarios
- `POST /api/admin/login` - Login de administrador

## 🧪 Testing

### Backend
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend
```bash
cd frontend
npm test
npm run test:ui
```

## 📊 Base de Datos

### Modelos Principales
- **User** - Usuarios del sistema
- **Project** - Proyectos de la plataforma
- **ForumUser** - Usuarios del foro
- **ForumPost** - Posts del foro
- **ForumComment** - Comentarios del foro

### Migraciones
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## 🔧 Configuración

### Variables de Entorno (Backend)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/florka_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
```

## 🚀 Despliegue

### Producción con Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Variables de Entorno de Producción
- Cambiar `NODE_ENV` a `production`
- Usar secretos seguros para JWT
- Configurar CORS para tu dominio
- Habilitar HTTPS

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Cognos** - Arquitecto Full-Stack Senior
- **Desarrollo** - Sistema de autenticación y arquitectura base

## 🔮 Roadmap

- [ ] Sistema de recuperación de contraseña
- [ ] Autenticación OAuth (Google, GitHub)
- [ ] Dashboard de analytics
- [ ] Sistema de notificaciones
- [ ] API de webhooks
- [ ] Integración con servicios de terceros
- [ ] Sistema de facturación
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Aplicación móvil

---

**¿Necesitas ayuda?** Abre un [issue](https://github.com/Herocku2/florka-saas-platform/issues) o contacta al equipo de desarrollo.