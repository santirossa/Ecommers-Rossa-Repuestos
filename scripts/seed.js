require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // ========================
        // Crear Admin
        // ========================
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@rossarepuestos.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            await User.create({
                name: process.env.ADMIN_NAME || 'Administrador',
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'Admin123456!',
                role: 'admin',
                phone: '',
            });
            console.log(`✅ Admin creado: ${adminEmail}`);
        } else {
            console.log(`⚠️  Admin ya existe: ${adminEmail}`);
        }

        // ========================
        // Crear Categorías
        // ========================
        const categories = [
            { name: 'Motor', description: 'Repuestos para motor IVECO' },
            { name: 'Frenos', description: 'Pastillas, discos y componentes de freno' },
            { name: 'Suspensión', description: 'Amortiguadores, elásticos y componentes de suspensión' },
            { name: 'Transmisión', description: 'Embrague, caja de cambios y diferencial' },
            { name: 'Eléctrica', description: 'Alternadores, arranques, baterías y electrónica' },
            { name: 'Carrocería', description: 'Paragolpes, espejos, ópticas y accesorios' },
            { name: 'Filtros', description: 'Filtros de aire, aceite, combustible y habitáculo' },
            { name: 'Dirección', description: 'Bombas hidráulicas, terminales y componentes de dirección' },
            { name: 'Refrigeración', description: 'Radiadores, termostatos, bombas de agua' },
            { name: 'Escape', description: 'Caños de escape, catalizadores, silenciadores' },
            { name: 'Accesorios', description: 'Utilitarios y accesorios varios para camiones' },
        ];

        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`✅ Categoría creada: ${cat.name}`);
            } else {
                console.log(`⚠️  Categoría ya existe: ${cat.name}`);
            }
        }

        console.log('\n🎉 Seed completado exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
