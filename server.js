require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Conectar a MongoDB
connectDB();

const app = express();

// ========================
// Middlewares globales
// ========================

// Seguridad
app.use(
    helmet({
        contentSecurityPolicy: false, // Desactivar para el panel admin con EJS
        crossOriginEmbedderPolicy: false,
    })
);

// CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing simple (sin dependencia extra)
app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie;
    req.cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
            const [name, ...rest] = cookie.trim().split('=');
            req.cookies[name] = rest.join('=');
        });
    }
    next();
});

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, 'public', 'admin')));

// View engine para panel admin
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'admin/layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========================
// Rutas API
// ========================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// ========================
// Rutas Admin Panel
// ========================
app.use('/admin', require('./routes/adminRoutes'));

// ========================
// Ruta raíz
// ========================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚚 Rossa Repuestos API — Repuestos IVECO',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders',
            categories: '/api/categories',
            payments: '/api/payments',
            stats: '/api/stats',
            admin: '/admin',
        },
    });
});

// ========================
// Error handler
// ========================
app.use(errorHandler);

// ========================
// Iniciar servidor
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   🚚 Rossa Repuestos - Backend Server       ║
║   Puerto: ${PORT}                              ║
║   Entorno: ${process.env.NODE_ENV || 'development'}                   ║
║   Admin Panel: http://localhost:${PORT}/admin    ║
║   API: http://localhost:${PORT}/api              ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
