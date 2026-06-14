import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { type Order, type OrderStatus } from '../../services/order.service'
import { formatPrice } from '../../utils/formatPrice'
import OrderStatusBadge from '../account/components/OrderStatusBadge'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const STATUS_OPTIONS: OrderStatus[] = [
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
]

function getItemImage(productImages: string | undefined): string | null {
  if (!productImages) return null
  try {
    const parsed = JSON.parse(productImages)
    return Array.isArray(parsed) ? parsed[0] ?? null : null
  } catch {
    return productImages.startsWith('http') ? productImages : null
  }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder]           = useState<Order | null>(null)
  const [loading, setLoading]       = useState(true)
  const [updating, setUpdating]     = useState(false)
  const [newStatus, setNewStatus]   = useState<OrderStatus>('pending')
  const [tracking, setTracking]     = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .get(`/admin/orders/${id}`)
      .then((res) => {
        const o: Order = res.data?.order ?? res.data
        setOrder(o)
        setNewStatus(o.status)
        const raw = o as unknown as Record<string,unknown>
        setTracking((raw.tracking_number as string) ?? '')
        setAdminNotes((raw.admin_notes as string) ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async () => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await api.patch(`/admin/orders/${order.id}/status`, { status: newStatus })
      const updated: Order = res.data?.order ?? res.data
      setOrder(updated)
      toast.success('Order status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveMeta = async () => {
    if (!order) return
    setSavingMeta(true)
    try {
      await api.patch(`/admin/orders/${order.id}/meta`, {
        tracking_number: tracking,
        admin_notes:     adminNotes,
      })
      toast.success('Order updated')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSavingMeta(false)
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
          Order #{order.order_number ?? order.id}
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
          <Button onClick={handleStatusUpdate} loading={updating} disabled={newStatus === order.status} size="sm">
            Update
          </Button>
        </div>
      </div>

      {/* Tracking + Admin notes */}
      <div className="mb-6 p-4 border border-accent space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider">Suivi &amp; Notes internes</p>
        <Input
          label="Numéro de suivi"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="EX123456789FR"
        />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Notes internes</label>
          <textarea
            className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white resize-none"
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Notes visibles uniquement par l'admin..."
          />
        </div>
        <Button size="sm" onClick={handleSaveMeta} loading={savingMeta}>Save</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="md:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3">Items</h2>
          <div className="space-y-2">
            {(order.items ?? []).map((item) => {
              const img = getItemImage((item as Record<string, string>).product_images)
              return (
                <div key={item.id} className="flex items-center gap-4 p-3 border border-accent">
                  <div className="w-14 h-14 bg-accent flex-shrink-0">
                    {img && <img src={img} alt={item.product_name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product_name}</p>
                    <p className="text-xs text-muted">
                      {formatPrice(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shipping */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3">Shipping Address</h2>
          <div className="p-4 border border-accent text-sm space-y-1">
            {order.shipping_name && <p className="font-semibold">{order.shipping_name}</p>}
            {order.user_email && <p className="text-muted text-xs">{order.user_email}</p>}
            {order.shipping_address && <p className="text-muted">{order.shipping_address}</p>}
            {(order.shipping_city || order.shipping_zip) && (
              <p className="text-muted">
                {[order.shipping_city, order.shipping_zip].filter(Boolean).join(', ')}
              </p>
            )}
            {order.shipping_country && <p className="text-muted">{order.shipping_country}</p>}
            {order.shipping_phone && <p className="text-muted">{order.shipping_phone}</p>}
          </div>
        </div>

        {/* Summary */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3">Order Summary</h2>
          <div className="p-4 border border-accent space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(order.subtotal ?? order.total ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{(order.shipping_fee ?? 0) === 0 ? 'Free' : formatPrice(order.shipping_fee ?? 0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-accent font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total ?? order.total_amount ?? 0)}</span>
            </div>
            {order.payment_method && (
              <div className="pt-2 border-t border-accent text-xs">
                <span className="text-muted">Payment: </span>
                <span className="font-bold uppercase tracking-wider">
                  {order.payment_method.replace(/_/g, ' ')}
                </span>
              </div>
            )}
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
