import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../hooks/useAuth'
import { formatPrice } from '../../utils/formatPrice'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const cartTotal = total()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout')
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <ShoppingBag size={48} className="mx-auto text-accent mb-4" />
        <h1 className="text-xl font-black uppercase tracking-wider mb-2">Your Cart is Empty</h1>
        <p className="text-sm text-muted mb-6">Add some products to get started.</p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    )
  }

  const shipping = cartTotal >= 50 ? 0 : 4.99

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]}
        className="mb-6"
      />
      <h1 className="text-2xl font-black uppercase tracking-wider mb-8">
        Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1">
          {/* Header */}
          <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider mb-2">
            <span className="col-span-2">Product</span>
            <span>Price</span>
            <span>Qty</span>
            <span>Total</span>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="grid grid-cols-3 md:grid-cols-5 gap-4 p-4 border border-accent items-center"
              >
                {/* Image + Name */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-14 h-14 bg-accent flex-shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-xs font-bold hover:underline line-clamp-2"
                    >
                      {item.name}
                    </Link>
                  </div>
                </div>

                {/* Price */}
                <p className="text-xs font-bold hidden md:block">{formatPrice(item.price)}</p>

                {/* Qty */}
                <div className="flex items-center border border-accent">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-2 py-1 hover:bg-accent transition-colors text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="px-2 py-1 text-xs font-bold min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-2 py-1 hover:bg-accent transition-colors text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Total + Delete */}
                <div className="flex items-center justify-between md:justify-start gap-3">
                  <p className="text-xs font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    onClick={() => {
                      removeItem(item.productId)
                      toast.success('Item removed')
                    }}
                    className="p-1 hover:text-[#D32F2F] transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Link to="/products" className="text-xs text-muted hover:text-black transition-colors flex items-center gap-1 uppercase tracking-wider">
              ← Continue Shopping
            </Link>
            <button
              onClick={() => { clearCart(); toast.success('Cart cleared') }}
              className="text-xs text-muted hover:text-[#D32F2F] transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <Trash2 size={12} /> Clear Cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="border border-accent p-6">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {cartTotal < 50 && (
                <p className="text-xs text-muted">
                  Add {formatPrice(50 - cartTotal)} more for free shipping
                </p>
              )}
            </div>

            <div className="flex justify-between py-3 border-t border-black font-black text-sm mb-4">
              <span>Total</span>
              <span>{formatPrice(cartTotal + shipping)}</span>
            </div>

            <Button fullWidth size="lg" onClick={handleCheckout}>
              Checkout <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
