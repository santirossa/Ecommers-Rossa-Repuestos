import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('rossa_admin_token');
        const saved = localStorage.getItem('rossa_admin_user');
        if (token && saved) {
            setUser(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.user.role !== 'admin') {
            throw new Error('Sin permisos de administrador');
        }
        localStorage.setItem('rossa_admin_token', data.token);
        localStorage.setItem('rossa_admin_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('rossa_admin_token');
        localStorage.removeItem('rossa_admin_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
