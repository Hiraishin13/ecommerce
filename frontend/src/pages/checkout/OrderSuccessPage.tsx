import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import { orderService, type Order } from '../../services/order.service'
import { formatPrice } from '../../utils/formatPrice'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

function getItemImage(productImages: string | undefined): string | null {
  if (!productImages) return null
  try {
    const parsed = JSON.parse(productImages)
    return Array.isArray(parsed) ? parsed[0] ?? null : null
  } catch {
    return productImages.startsWith('http') ? productImages : null
  }
}

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    orderService
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle size={64} className="text-[#388E3C]" strokeWidth={1.5} />
      </div>

      <h1 className="text-3xl font-black uppercase tracking-wider mb-2">Order Placed!</h1>
      <p className="text-sm text-muted mb-8">
        Thank you for your purchase. We&apos;ll process your order right away.
      </p>

      {order && (
        <div className="border border-accent p-6 text-left mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Order Number</p>
              <p className="text-lg font-black">#{order.order_number ?? order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted uppercase tracking-wider">Total</p>
              <p className="text-lg font-black">{formatPrice(order.total ?? order.total_amount ?? 0)}</p>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="border-t border-accent pt-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-3">Items</p>
              <div className="space-y-2">
                {order.items.map((item) => {
                  const img = getItemImage((item as Record<string, string>).product_images)
                  const name = item.product_name
                  const price = item.unit_price
                  return (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <div className="w-10 h-10 bg-accent flex-shrink-0">
                        {img && <img src={img} alt={name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="flex-1 font-medium">{name}</span>
                      <span className="text-muted">×{item.quantity}</span>
                      <span className="font-bold">{formatPrice(price * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="border-t border-accent mt-4 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Shipping to</p>
            <p className="text-xs text-muted">
              {order.shipping_name}
              {order.shipping_address && `, ${order.shipping_address}`}
              {order.shipping_city && `, ${order.shipping_city}`}
              {order.shipping_country && `, ${order.shipping_country}`}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/account/orders">
          <Button variant="secondary">
            <ShoppingBag size={16} />
            View My Orders
          </Button>
        </Link>
        <Link to="/products">
          <Button>
            Continue Shopping
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
