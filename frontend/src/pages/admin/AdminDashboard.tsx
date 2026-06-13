import { useEffect, useState, type ElementType } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Users, DollarSign, Package, ArrowRight } from 'lucide-react'
import api from '../../services/api'
import { type Order } from '../../services/order.service'
import { formatPrice } from '../../utils/formatPrice'
import OrderStatusBadge from '../account/components/OrderStatusBadge'
import Spinner from '../../components/ui/Spinner'

interface KPI {
  label: string
  value: string | number
  icon: ElementType
  color: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ orders: Order[]; total: number }>('/admin/orders?limit=10')
      .then((res) => setOrders(res.data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)

  const kpis: KPI[] = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-black text-white',
    },
    {
      label: 'Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-[#388E3C] text-white',
    },
    {
      label: 'Pending Orders',
      value: orders.filter((o) => o.status === 'pending').length,
      icon: Package,
      color: 'bg-[#F57C00] text-white',
    },
    {
      label: 'Customers',
      value: '—',
      icon: Users,
      color: 'bg-[#1A1A1A] text-white',
    },
  ]

  return (
    <div>
      <h1 className="text-xl font-black uppercase tracking-wider mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-accent p-5">
            <div className={`w-10 h-10 flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-2xl font-black mb-1">{kpi.value}</p>
            <p className="text-xs text-muted uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs text-muted hover:text-black transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="border border-accent overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black text-white text-xs">
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Order #</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-t border-accent hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 font-bold text-xs">#{order.order_number}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-xs">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-xs text-muted hover:text-black transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted text-xs uppercase tracking-wider">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
