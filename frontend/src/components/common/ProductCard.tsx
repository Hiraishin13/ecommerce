import { useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Heart } from 'lucide-react'
import { m } from 'framer-motion'
import type { Variants } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { formatPrice, formatDiscount } from '../../utils/formatPrice'
import Badge from '../ui/Badge'
import type { Product } from '../../services/product.service'

interface ProductCardProps {
  product: Product
}

export const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0  },
}

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding]   = useState(false)
  const addItem               = useCartStore((s) => s.addItem)
  const { toggle, has }       = useWishlistStore()

  const isFav       = has(product.id)
  const discount    = formatDiscount(product.price, product.compare_price ?? 0)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    setAdding(true)
    addItem({
      id:        product.id,
      productId: product.id,
      name:      product.name,
      price:     product.price,
      quantity:  1,
      image:     product.images[0],
      slug:      product.slug,
    })
    toast.success('Ajouté au panier')
    setAdding(false)
  }

  const handleToggleFav = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const wasInWishlist = isFav
    toggle({
      id:            product.id,
      name:          product.name,
      slug:          product.slug,
      price:         product.price,
      compare_price: product.compare_price ?? null,
      image:         product.images?.[0] ?? null,
    })
    toast(wasInWishlist ? 'Retiré des favoris' : 'Ajouté aux favoris', {
      icon: wasInWishlist ? '♡' : '♥',
    })
  }

  return (
    <m.div variants={cardVariants}>
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

          {/* Bouton favori */}
          <m.button
            onClick={handleToggleFav}
            aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            whileTap={{ scale: 0.85 }}
            transition={{ duration: 0.1 }}
            className={`
              absolute top-3 right-3 w-8 h-8 flex items-center justify-center
              bg-white/90 backdrop-blur-sm shadow-sm
              transition-opacity duration-200
              opacity-0 group-hover:opacity-100
              ${isFav ? '!opacity-100' : ''}
            `}
          >
            <Heart
              size={15}
              className={isFav ? 'fill-red-500 text-red-500' : 'text-[#1A1A1A]'}
            />
          </m.button>

          {/* Add to cart overlay */}
          {!isOutOfStock && (
            <m.button
              onClick={handleAddToCart}
              disabled={adding}
              whileTap={{ scale: 0.97 }}
              className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs font-bold uppercase tracking-widest py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              {adding ? 'Ajout...' : 'Ajouter'}
            </m.button>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
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
    </m.div>
  )
}
