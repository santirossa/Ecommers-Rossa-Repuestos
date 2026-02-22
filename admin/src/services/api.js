import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    timeout: 15000,
});

// Agregar token en cada request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('rossa_admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Manejo global de errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('rossa_admin_token');
            localStorage.removeItem('rossa_admin_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
