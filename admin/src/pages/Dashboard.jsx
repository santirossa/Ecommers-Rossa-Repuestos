import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

const STATUS_LABEL = {
  pending:    { label: 'Pendiente',  cls: 'badge-yellow' },
  paid:       { label: 'Pagado',     cls: 'badge-green'  },
  processing: { label: 'Procesando', cls: 'badge-blue'   },
  shipped:    { label: 'Enviado',    cls: 'badge-blue'   },
  delivered:  { label: 'Entregado',  cls: 'badge-green'  },
  cancelled:  { label: 'Cancelado',  cls: 'badge-red'    },
};

function StatCard({ icon, label, value, sub, growth, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ background: `${color}20` }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
        </div>
        {growth !== undefined && (
          <span className={`stat-card-growth ${parseFloat(growth) >= 0 ? 'positive' : 'negative'}`}>
            {parseFloat(growth) >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
          </span>
        )}
      </div>
      <div>
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    </div>
  );
}

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const [stats,  setStats]  = useState(null);
  const [chart,  setChart]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,  setError]  = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/sales-chart'),
    ])
      .then(([s, c]) => {
        setStats(s.data.stats);
        setChart(c.data.sales);
      })
      .catch((e) => setError(e.response?.data?.message || 'Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Vista general del negocio</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon="📦"
          label="Pedidos este mes"
          value={stats.orders.thisMonth}
          sub={`${stats.orders.total} total`}
          growth={stats.orders.growth}
          color="#4a9eff"
        />
        <StatCard
          icon="💰"
          label="Ingresos este mes"
          value={formatARS(stats.revenue.thisMonth)}
          sub={`Total: ${formatARS(stats.revenue.total)}`}
          color="#2dd4a0"
        />
        <StatCard
          icon="🔩"
          label="Productos activos"
          value={stats.products.total}
          sub={stats.products.lowStock > 0 ? `⚠ ${stats.products.lowStock} con poco stock` : 'Stock OK'}
          color="#e8402a"
        />
        <StatCard
          icon="👥"
          label="Clientes"
          value={stats.users.total}
          sub={`+${stats.users.newThisMonth} este mes`}
          color="#f0c040"
        />
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid-2">
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ventas últimos 30 días</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'var(--text-3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-2)' }}
                formatter={(v) => [formatARS(v), 'Ventas']}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estados de pedidos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Estado de pedidos</span>
            <Link to="/orders" className="btn btn-ghost btn-sm">Ver todos →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge ${STATUS_LABEL[status]?.cls || 'badge-gray'}`}>
                  {STATUS_LABEL[status]?.label || status}
                </span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="card mt-6">
        <div className="card-header">
          <span className="card-title">Pedidos recientes</span>
          <Link to="/orders" className="btn btn-ghost btn-sm">Ver todos →</Link>
        </div>
        <div className="table-wrap" style={{ border: 'none', marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => {
                const st = STATUS_LABEL[order.status] || { label: order.status, cls: 'badge-gray' };
                return (
                  <tr key={order._id}>
                    <td className="text-mono" style={{ fontSize: 11 }}>
                      <Link to={`/orders/${order._id}`} style={{ color: 'var(--accent-2)' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td>{order.user?.name || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{formatARS(order.total)}</td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td className="text-muted" style={{ fontSize: 12 }}>
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
