import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role)   params.append('role', role);
    const { data } = await api.get(`/admin/users?${params}`);
    setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => { load(); }, [role]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const handleToggle = async (id) => {
    await api.patch(`/admin/users/${id}/toggle`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestión de clientes y administradores</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3 items-center">
          <div className="search-wrap" style={{ flex: 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="form-input" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {['', 'client', 'admin'].map((r) => (
            <button key={r} className={`btn btn-sm ${role === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => setRole(r)}>
              {{ '': 'Todos', client: 'Clientes', admin: 'Admins' }[r]}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Usuario</th><th>Rol</th><th>Teléfono</th><th>Registro</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">{u.name[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-3)' }}>{u.phone || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(u.createdAt).toLocaleDateString('es-AR')}</td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={u.active} onChange={() => handleToggle(u._id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
