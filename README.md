# 🚚 Rossa Repuestos — E-commerce IVECO

Sistema de e-commerce para repuestos IVECO con panel administrador separado.

## Estructura del proyecto

```
rossa-repuestos/
├── backend/          API REST (Node.js + Express + MongoDB)
└── frontend/         Panel Admin (React + Vite + Tailwind)
```

## Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Completar con tus datos
npm run seed           # Crear admin y categorías iniciales
npm run dev            # Servidor en http://localhost:5001
```

### Frontend (Admin Panel)
```bash
cd frontend
npm install
npm run dev            # Panel en http://localhost:5173
```

## Credenciales admin por defecto
- Email: `admin@rossarepuestos.com`
- Password: `Admin123456!`

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/products | Listar productos |
| POST | /api/products | Crear producto (admin) |
| PUT | /api/products/:id | Editar producto (admin) |
| DELETE | /api/products/:id | Eliminar producto (admin) |
| PATCH | /api/products/:id/toggle | Activar/desactivar (admin) |
| GET | /api/categories | Categorías |
| GET | /api/orders | Órdenes |
| PATCH | /api/orders/:id/status | Cambiar estado orden (admin) |
| GET | /api/stats | Estadísticas (admin) |
