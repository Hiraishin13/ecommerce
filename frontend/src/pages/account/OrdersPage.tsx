import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { orderService, type Order } from '../../services/order.service'
import { formatPrice } from '../../utils/formatPrice'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import OrderStatusBadge from './components/OrderStatusBadge'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    orderService
      .getOrders(page)
      .then((res) => {
        setOrders(res.orders ?? [])
        setTotalPages(res.totalPages ?? 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h1 className="text-xl font-black uppercase tracking-wider mb-6">My Orders</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-accent">
          <ShoppingBag size={32} className="mx-auto text-accent mb-3" />
          <p className="text-sm text-muted uppercase tracking-wider mb-4">You have no orders</p>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider">
              <span>Order #</span>
              <span>Date</span>
              <span>Status</span>
              <span>Total</span>
              <span></span>
            </div>

            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 py-4 border border-accent hover:border-black transition-colors items-center"
              >
                <div>
                  <p className="text-xs font-bold">#{order.order_number}</p>
                  <p className="text-xs text-muted md:hidden">
                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <p className="hidden md:block text-xs text-muted">
                  {new Date(order.created_at).toLocaleDateString('en-GB')}
                </p>
                <div className="flex items-center justify-end md:justify-start">
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="hidden md:block text-sm font-bold">{formatPrice(order.total)}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="md:hidden text-sm font-bold">{formatPrice(order.total)}</span>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline"
                  >
                    View <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}
