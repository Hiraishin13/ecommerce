import { useEffect, useState, type ElementType } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { orderService, type Order, type OrderStatus } from '../../services/order.service'
import { formatPrice } from '../../utils/formatPrice'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import OrderStatusBadge from './components/OrderStatusBadge'
import toast from 'react-hot-toast'

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const stepIcons: Record<string, ElementType> = {
  pending: Clock,
  confirmed: AlertCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    orderService
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!order) return
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const updated = await orderService.cancelOrder(order.id)
      setOrder(updated)
      toast.success('Order cancelled')
    } catch {
      toast.error('Failed to cancel order')
    } finally {
      setCancelling(false)
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
        <Link to="/account/orders"><Button variant="secondary">Back to Orders</Button></Link>
      </div>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/account/orders" className="p-1 hover:bg-accent transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-black uppercase tracking-wider">
          Order #{order.order_number}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status timeline */}
      {order.status !== 'cancelled' && (
        <div className="mb-8 p-4 border border-accent">
          <p className="text-xs font-bold uppercase tracking-wider mb-4">Order Progress</p>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = stepIcons[step]
              const isActive = idx <= currentStep
              const isLast = idx === STATUS_STEPS.length - 1
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isActive ? 'bg-black border-black text-white' : 'border-accent text-muted'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <p className={`text-[10px] mt-1 uppercase tracking-wider hidden sm:block ${isActive ? 'font-bold' : 'text-muted'}`}>
                      {step}
                    </p>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mx-1 ${idx < currentStep ? 'bg-black' : 'bg-accent'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

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
                  <p className="text-xs text-muted">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
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
            <div className="pt-2 border-t border-accent">
              <span className="text-xs text-muted uppercase tracking-wider">Payment: </span>
              <span className="text-xs font-bold uppercase tracking-wider">{order.payment_method.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(order.status === 'pending' || order.status === 'confirmed') && (
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={handleCancel}
            loading={cancelling}
            className="border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white"
          >
            Cancel Order
          </Button>
        </div>
      )}
    </div>
  )
}
