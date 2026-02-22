import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const COMPAT = ['Daily', 'Tector', 'Stralis', 'Cursor', 'Eurocargo', 'Powerstar'];

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

// ======================== MODAL FORM ========================
function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(
    product || { name: '', description: '', price: '', priceOffer: '', stock: '', category: '', brand: '', partNumber: '', compatible: [], active: true, featured: false }
  );
  const [files,   setFiles]   = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCompat = (model) => {
    const arr = form.compatible || [];
    set('compatible', arr.includes(model) ? arr.filter((x) => x !== model) : [...arr, model]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'compatible') fd.append(k, v.join(','));
        else if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
      });
      files.forEach((f) => fd.append('images', f));

      if (product?._id) {
        await api.put(`/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-2 mb-4">
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Nombre del producto *</label>
              <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Ej: Filtro de aceite IVECO Daily" />
            </div>
            <div className="form-group">
              <label className="form-label">Precio (ARS) *</label>
              <input className="form-input" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Precio oferta</label>
              <input className="form-input" type="number" value={form.priceOffer} onChange={(e) => set('priceOffer', e.target.value)} min="0" placeholder="Vacío = sin oferta" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input className="form-input" type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select className="form-select" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="form-input" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="IVECO, Bosch, Mann..." />
            </div>
            <div className="form-group">
              <label className="form-label">Número de parte</label>
              <input className="form-input" value={form.partNumber} onChange={(e) => set('partNumber', e.target.value)} placeholder="Ej: 504074608" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Descripción del producto..." />
            </div>

            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Modelos compatibles</label>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {COMPAT.map((m) => (
                  <button key={m} type="button"
                    className={`btn btn-sm ${form.compatible?.includes(m) ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => toggleCompat(m)}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Imágenes</label>
              <div className="image-upload-area" onClick={() => fileRef.current?.click()}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
                <div style={{ fontSize: 13 }}>Click para subir imágenes (máx. 6)</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>JPG, PNG, WEBP — máx. 5MB c/u</div>
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                onChange={(e) => setFiles(Array.from(e.target.files))} />
              {files.length > 0 && (
                <div className="image-previews">
                  {files.map((f, i) => (
                    <div key={i} className="image-preview">
                      <img src={URL.createObjectURL(f)} alt="" />
                      <button className="image-preview-remove" type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {product?.images?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '8px 0 4px' }}>Imágenes actuales:</p>
                  <div className="image-previews">
                    {product.images.map((img, i) => (
                      <div key={i} className="image-preview">
                        <img src={img.url} alt="" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 items-center" style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Producto activo</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Destacado</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ======================== MAIN PAGE ========================
export default function Products() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'new' | product
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting,   setDeleting]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (filter === 'active')   params.append('active', 'true');
      if (filter === 'inactive') params.append('active', 'false');

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data.categories)); }, []);
  useEffect(() => { load(); }, [page, filter]);
  useEffect(() => { setPage(1); load(); }, [search]);

  const handleToggle = async (id) => {
    await api.patch(`/products/${id}/toggle`);
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      load();
    } finally {
      setDeleting('');
    }
  };

  return (
    <div>
      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">Gestión del catálogo de repuestos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          + Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="form-input"
              placeholder="Buscar por nombre, N° de parte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {['all', 'active', 'inactive'].map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setFilter(f); setPage(1); }}>
              {{ all: 'Todos', active: 'Activos', inactive: 'Inactivos' }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔩</div>
            <div className="empty-state-title">Sin productos</div>
            <div className="empty-state-sub">Creá el primer producto con el botón de arriba</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {p.images?.[0]
                        ? <img src={p.images[0].url} alt="" className="product-thumb" />
                        : <div className="product-thumb" style={{ display: 'grid', placeItems: 'center', fontSize: 18 }}>🔩</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{p.name}</div>
                        {p.partNumber && <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>#{p.partNumber}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{p.category?.name || '—'}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatARS(p.price)}</div>
                    {p.priceOffer && <div style={{ fontSize: 11, color: 'var(--green)' }}>{formatARS(p.priceOffer)} oferta</div>}
                  </td>
                  <td>
                    <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-yellow' : 'badge-green'}`}>
                      {p.stock} u.
                    </span>
                  </td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={p.active} onChange={() => handleToggle(p._id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(p)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id}>
                        {deleting === p._id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
            <button key={n} className={`pagination-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
