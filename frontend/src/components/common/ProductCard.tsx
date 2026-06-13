import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '../../store/cartStore'
import { formatPrice, formatDiscount } from '../../utils/formatPrice'
import Badge from '../ui/Badge'
import type { Product } from '../../services/product.service'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const discount = formatDiscount(product.price, product.compare_price ?? 0)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    setAdding(true)
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      slug: product.slug,
    })
    toast.success('Added to cart')
    setAdding(false)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block relative bg-white hover:shadow-md transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-accent overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs uppercase tracking-wider">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount > 0 && <Badge variant="SALE" label={`-${discount}%`} />}
          {product.is_featured && !discount && <Badge variant="NEW" />}
          {isOutOfStock && <Badge variant="OUT_OF_STOCK" />}
        </div>

        {/* Add to cart overlay */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs font-bold uppercase tracking-widest py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} />
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-muted uppercase tracking-wider mb-1">
          {product.category?.name}
        </p>
        <h3 className="text-sm font-semibold text-[#1A1A1A] line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
