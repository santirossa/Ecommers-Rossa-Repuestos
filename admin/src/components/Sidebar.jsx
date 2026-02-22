import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚚</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Rossa</span>
          <span className="sidebar-logo-sub">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Principal</span>

        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
          Dashboard
        </NavLink>

        <span className="nav-section-label">Catálogo</span>

        <NavLink to="/products" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Icon d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          Productos
        </NavLink>

        <NavLink to="/categories" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Icon d="M4 6h16M4 12h16M4 18h7" />
          Categorías
        </NavLink>

        <span className="nav-section-label">Ventas</span>

        <NavLink to="/orders" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Icon d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0" />
          Pedidos
        </NavLink>

        <span className="nav-section-label">Sistema</span>

        <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          Usuarios
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="header-user" style={{ marginBottom: 8 }}>
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Administrador</div>
          </div>
        </div>
        <button className="nav-link" onClick={handleLogout} style={{ color: 'var(--accent-2)' }}>
          <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
