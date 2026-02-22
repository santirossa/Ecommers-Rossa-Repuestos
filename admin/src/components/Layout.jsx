import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <div className="spinner" />
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 8 }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/login" replace />;

  const titles = {
    '/':           'Dashboard',
    '/products':   'Productos',
    '/categories': 'Categorías',
    '/orders':     'Pedidos',
    '/users':      'Usuarios',
  };

  const title = titles[location.pathname] ||
    (location.pathname.startsWith('/products') ? 'Productos' :
     location.pathname.startsWith('/orders')   ? 'Pedidos'   : 'Panel');

  return (
    <div className="layout">
      <Sidebar />
      <header className="header">
        <span className="header-title">
          Rossa Repuestos / <strong style={{ color: 'var(--text)' }}>{title}</strong>
        </span>
        <div className="header-actions">
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
