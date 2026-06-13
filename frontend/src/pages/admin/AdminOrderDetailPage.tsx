import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService, type Order, type OrderStatus } from '../../services/order.service'
import { formatPrice } from '../../utils/formatPrice'
import OrderStatusBadge from '../account/components/OrderStatusBadge'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import api from '../../services/api'

const STATUS_OPTIONS: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
]

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')

  useEffect(() => {
    if (!id) return
    orderService
      .getOrder(Number(id))
      .then((o) => { setOrder(o); setNewStatus(o.status) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async () => {
    if (!order) return
    setUpdating(true)
    try {
      const { data } = await api.put<Order>(`/orders/${order.id}/status`, { status: newStatus })
      setOrder(data)
      toast.success('Order status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted mb-4">Order not found.</p>
        <Link to="/admin/orders"><Button variant="secondary">Back to Orders</Button></Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/orders" className="p-1 hover:bg-accent transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-black uppercase tracking-wider">
          Order #{order.order_number}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status update */}
      <div className="mb-6 p-4 border border-accent">
        <p className="text-xs font-bold uppercase tracking-wider mb-3">Update Status</p>
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            className="border border-accent px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <Button
            onClick={handleStatusUpdate}
            loading={updating}
            disabled={newStatus === order.status}
            size="sm"
          >
            Update
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="md:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3">Items</h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 border border-accent">
                <div className="w-14 h-14 bg-accent flex-shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer / Shipping */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3">Shipping Address</h2>
          <div className="p-4 border border-accent text-sm space-y-1">
            <p className="font-semibold">
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </p>
            <p className="text-muted">{order.shipping_address.address}</p>
            <p className="text-muted">
              {order.shipping_address.city}, {order.shipping_address.postal_code}
            </p>
            <p className="text-muted">{order.shipping_address.country}</p>
            <p className="text-muted">{order.shipping_address.phone}</p>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3">Order Summary</h2>
          <div className="p-4 border border-accent space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-accent font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="pt-2 border-t border-accent text-xs">
              <span className="text-muted">Payment: </span>
              <span className="font-bold uppercase tracking-wider">
                {order.payment_method.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted">Ordered: </span>
              <span>{new Date(order.created_at).toLocaleString('en-GB')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
