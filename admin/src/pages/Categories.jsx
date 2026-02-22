import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function CategoryModal({ category, onClose, onSaved }) {
  const [form,  setForm]  = useState(category || { name: '', description: '', order: 0, active: true });
  const [file,  setFile]  = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
      if (file) fd.append('image', file);

      if (category?._id) {
        await api.put(`/categories/${category._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 480, padding: 28 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Ej: Motor" />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input className="form-input" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Descripción breve" />
            </div>
            <div className="form-group">
              <label className="form-label">Orden (para el menú)</label>
              <input className="form-input" type="number" value={form.order} onChange={(e) => set('order', e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Imagen</label>
              <div className="image-upload-area" onClick={() => fileRef.current?.click()}>
                {file
                  ? <img src={URL.createObjectURL(file)} alt="" style={{ height: 60, objectFit: 'cover', borderRadius: 6 }} />
                  : category?.image?.url
                    ? <img src={category.image.url} alt="" style={{ height: 60, objectFit: 'cover', borderRadius: 6 }} />
                    : <><div style={{ fontSize: 24 }}>🖼</div><div style={{ fontSize: 12, marginTop: 4 }}>Click para subir imagen</div></>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <label className="toggle">
                <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Categoría activa</span>
            </label>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/categories');
    setCategories(data.categories);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    await api.delete(`/categories/${id}`);
    load();
  };

  return (
    <div>
      {modal && <CategoryModal category={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">Organización del catálogo</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>+ Nueva Categoría</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Categoría</th><th>Descripción</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {c.image?.url
                        ? <img src={c.image.url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg-3)', display: 'grid', placeItems: 'center', fontSize: 16 }}>📁</div>
                      }
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{c.description || '—'}</td>
                  <td>{c.order}</td>
                  <td><span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Activa' : 'Inactiva'}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(c)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}>Eliminar</button>
                    </div>
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
