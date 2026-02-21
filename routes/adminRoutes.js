const express = require('express');
const router = express.Router();

// Middleware para verificar token admin desde cookie en las vistas
const verifyAdminView = (req, res, next) => {
    const token = req.cookies ? req.cookies.token : null;
    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        User.findById(decoded.id)
            .then((user) => {
                if (!user || user.role !== 'admin') {
                    return res.redirect('/admin/login');
                }
                req.user = user;
                next();
            })
            .catch(() => res.redirect('/admin/login'));
    } catch {
        return res.redirect('/admin/login');
    }
};

// Login (sin protección)
router.get('/login', (req, res) => {
    res.render('admin/login', { title: 'Login - Rossa Repuestos Admin', layout: false });
});

// Dashboard
router.get('/', verifyAdminView, (req, res) => {
    res.render('admin/dashboard', {
        title: 'Dashboard - Rossa Repuestos Admin',
        user: req.user,
        active: 'dashboard',
    });
});

router.get('/dashboard', verifyAdminView, (req, res) => {
    res.render('admin/dashboard', {
        title: 'Dashboard - Rossa Repuestos Admin',
        user: req.user,
        active: 'dashboard',
    });
});

// Productos
router.get('/products', verifyAdminView, (req, res) => {
    res.render('admin/products', {
        title: 'Productos - Rossa Repuestos Admin',
        user: req.user,
        active: 'products',
    });
});

router.get('/products/new', verifyAdminView, (req, res) => {
    res.render('admin/product-form', {
        title: 'Nuevo Producto - Rossa Repuestos Admin',
        user: req.user,
        active: 'products',
        editMode: false,
    });
});

router.get('/products/edit/:id', verifyAdminView, (req, res) => {
    res.render('admin/product-form', {
        title: 'Editar Producto - Rossa Repuestos Admin',
        user: req.user,
        active: 'products',
        editMode: true,
        productId: req.params.id,
    });
});

// Pedidos
router.get('/orders', verifyAdminView, (req, res) => {
    res.render('admin/orders', {
        title: 'Pedidos - Rossa Repuestos Admin',
        user: req.user,
        active: 'orders',
    });
});

router.get('/orders/:id', verifyAdminView, (req, res) => {
    res.render('admin/order-detail', {
        title: 'Detalle Pedido - Rossa Repuestos Admin',
        user: req.user,
        active: 'orders',
        orderId: req.params.id,
    });
});

// Categorías
router.get('/categories', verifyAdminView, (req, res) => {
    res.render('admin/categories', {
        title: 'Categorías - Rossa Repuestos Admin',
        user: req.user,
        active: 'categories',
    });
});

module.exports = router;
