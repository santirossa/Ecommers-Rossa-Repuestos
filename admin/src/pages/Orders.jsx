import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_CONFIG = {
  pending:    { label: 'Pendiente',   cls: 'badge-yellow' },
  paid:       { label: 'Pagado',      cls: 'badge-blue'   },
  processing: { label: 'Procesando',  cls: 'badge-blue'   },
  shipped:    { label: 'Enviado',     cls: 'badge-blue'   },
  delivered:  { label: 'Entregado',   cls: 'badge-green'  },
  cancelled:  { label: 'Cancelado',   cls: 'badge-red'    },
};

const PAYMENT_CONFIG = {
  pending:    { label: 'Pendiente',   cls: 'badge-yellow' },
  approved:   { label: 'Aprobado',    cls: 'badge-green'  },
  rejected:   { label: 'Rechazado',   cls: 'badge-red'    },
  in_process: { label: 'En proceso',  cls: 'badge-blue'   },
  refunded:   { label: 'Reintegrado', cls: 'badge-gray'   },
};

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

// Modal de detalle + cambio de estado
function OrderModal({ order, onClose, onUpdated }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [comment,   setComment]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) return onClose();
    setSaving(true); setError('');
    try {
      await api.patch(`/orders/${order._id}/status`, { status: newStatus, comment });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const st = STATUS_CONFIG[order.status] || { label: order.status, cls: 'badge-gray' };
  const pt = PAYMENT_CONFIG[order.payment?.status] || { label: order.payment?.status, cls: 'badge-gray' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>
              Pedido #{order._id.slice(-6).toUpperCase()}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {new Date(order.createdAt).toLocaleString('es-AR')}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Info cliente */}
        <div className="card mb-4" style={{ padding: 14 }}>
          <div className="card-title mb-4">Cliente</div>
          <div style={{ fontSize: 14 }}>
            <strong>{order.user?.name}</strong>
            <span style={{ color: 'var(--text-3)', marginLeft: 8 }}>{order.user?.email}</span>
          </div>
          {order.shippingAddress?.street && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.province}
            </div>
          )}
        </div>

        {/* Estado pago */}
        <div className="flex gap-3 mb-4">
          <div className="card" style={{ flex: 1, padding: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Estado pedido</div>
            <span className={`badge ${st.cls}`}>{st.label}</span>
          </div>
          <div className="card" style={{ flex: 1, padding: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Pago</div>
            <span className={`badge ${pt.cls}`}>{pt.label}</span>
          </div>
          <div className="card" style={{ flex: 1, padding: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Total</div>
            <strong style={{ fontSize: 16 }}>{formatARS(order.total)}</strong>
          </div>
        </div>

        {/* Items */}
        <div className="card mb-4" style={{ padding: 14 }}>
          <div className="card-title mb-4">Productos</div>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                {item.image
                  ? <img src={item.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                  : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg-3)', display: 'grid', placeItems: 'center' }}>🔩</div>
                }
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>x{item.quantity} × {formatARS(item.price)}</div>
                </div>
              </div>
              <strong>{formatARS(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="flex justify-between mt-4" style={{ fontSize: 14, color: 'var(--text-3)' }}>
            <span>Envío</span><span>{formatARS(order.shipping)}</span>
          </div>
          <div className="flex justify-between mt-2" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            <span>Total</span><span>{formatARS(order.total)}</span>
          </div>
        </div>

        {/* Cambiar estado */}
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <div className="card" style={{ padding: 14 }}>
          <div className="card-title mb-4">Cambiar estado</div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Nuevo estado</label>
              <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comentario (opcional)</label>
              <input className="form-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ej: Número de seguimiento..." />
            </div>
          </div>
          <button className="btn btn-primary mt-4" onClick={handleUpdateStatus} disabled={saving}>
            {saving ? 'Guardando...' : 'Actualizar estado'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== MAIN PAGE ========================
export default function Orders() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const loadOrder = async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    setSelected(data.order);
  };

  return (
    <div>
      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { setSelected(null); load(); }}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">Gestión de órdenes de compra</p>
        </div>
      </div>

      {/* Filtro por estado */}
      <div className="card mb-4">
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('')}>
            Todos
          </button>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <button key={k} className={`btn btn-sm ${statusFilter === k ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setStatusFilter(k); setPage(1); }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        {loading ? <div className="spinner" /> : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">Sin pedidos</div>
            <div className="empty-state-sub">Los pedidos aparecerán aquí cuando los clientes compren</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Items</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const st = STATUS_CONFIG[o.status] || { label: o.status, cls: 'badge-gray' };
                const pt = PAYMENT_CONFIG[o.payment?.status] || { label: o.payment?.status, cls: 'badge-gray' };
                return (
                  <tr key={o._id}>
                    <td className="text-mono" style={{ fontSize: 11 }}>#{o._id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{o.user?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{o.user?.email}</div>
                    </td>
                    <td>{o.items?.length} prod.</td>
                    <td style={{ fontWeight: 700 }}>{formatARS(o.total)}</td>
                    <td><span className={`badge ${pt.cls}`}>{pt.label}</span></td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {new Date(o.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => loadOrder(o._id)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
