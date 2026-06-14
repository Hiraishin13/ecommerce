import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, User, MapPin, Heart, ArrowRight } from 'lucide-react'
import { orderService, type Order } from '../../services/order.service'
import { useAuth } from '../../hooks/useAuth'
import { formatPrice } from '../../utils/formatPrice'
import OrderStatusBadge from './components/OrderStatusBadge'

export default function AccountDashboard() {
  const { user } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService
      .getOrders(1)
      .then((res) => setRecentOrders((res.orders ?? []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const quickLinks = [
    { to: '/account/orders', label: 'My Orders', icon: ShoppingBag, desc: 'Track your orders' },
    { to: '/account/profile', label: 'Profile', icon: User, desc: 'Update your info' },
    { to: '/account/addresses', label: 'Addresses', icon: MapPin, desc: 'Manage addresses' },
    { to: '/account/wishlist', label: 'Wishlist', icon: Heart, desc: 'Saved items' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-black uppercase tracking-wider">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted mt-1">{user?.email}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="border border-accent p-4 hover:border-black transition-colors group"
          >
            <link.icon size={20} className="mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5">{link.label}</p>
            <p className="text-xs text-muted">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider">Recent Orders</h2>
          <Link
            to="/account/orders"
            className="text-xs text-muted hover:text-black transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-accent animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-10 border border-accent">
            <ShoppingBag size={32} className="mx-auto text-accent mb-3" />
            <p className="text-sm text-muted uppercase tracking-wider">No orders yet</p>
            <Link
              to="/products"
              className="inline-block mt-3 text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 border border-accent hover:border-black transition-colors"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    #{order.order_number}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-GB')} ·{' '}
                    {(order.items?.length ?? 0)} {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                  <ArrowRight size={14} className="text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
