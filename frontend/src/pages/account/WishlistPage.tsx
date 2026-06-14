import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { m } from 'framer-motion'
import { useWishlistStore } from '../../store/wishlistStore'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/formatPrice'
import Button from '../../components/ui/Button'
import { stagger, staggerItem } from '../../utils/motion'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, remove, clear } = useWishlistStore()
  const addItem                  = useCartStore((s) => s.addItem)

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id:        item.id,
      productId: item.id,
      name:      item.name,
      price:     item.price,
      quantity:  1,
      image:     item.image ?? undefined,
      slug:      item.slug,
    })
    toast.success('Ajouté au panier')
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-black uppercase tracking-wider mb-6">Favoris</h1>
        <div className="text-center py-20 border border-accent">
          <Heart size={40} className="mx-auto text-accent mb-4" strokeWidth={1.5} />
          <p className="text-sm font-bold uppercase tracking-wider mb-2">Votre liste de favoris est vide</p>
          <p className="text-xs text-muted mb-6">Ajoutez des articles depuis la boutique pour les retrouver ici.</p>
          <Link to="/products">
            <Button>Parcourir la boutique</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">
          Favoris <span className="text-muted font-normal text-base">({items.length})</span>
        </h1>
        <button
          onClick={clear}
          className="text-xs text-muted hover:text-black transition-colors uppercase tracking-wider flex items-center gap-1"
        >
          <Trash2 size={12} /> Tout effacer
        </button>
      </div>

      <m.div
        className="space-y-3"
        variants={stagger(0.05)}
        initial="hidden"
        animate="visible"
      >
        {items.map((item) => (
          <m.div
            key={item.id}
            variants={staggerItem}
            className="flex items-center gap-4 border border-accent p-3 bg-white"
          >
            {/* Image */}
            <Link to={`/products/${item.slug}`} className="flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover bg-accent"
                />
              ) : (
                <div className="w-16 h-20 bg-accent" />
              )}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/products/${item.slug}`}
                className="text-sm font-bold hover:underline line-clamp-2 leading-snug"
              >
                {item.name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-black">{formatPrice(item.price)}</span>
                {item.compare_price && item.compare_price > item.price && (
                  <span className="text-xs text-muted line-through">{formatPrice(item.compare_price)}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <m.button
                onClick={() => handleAddToCart(item)}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors"
              >
                <ShoppingBag size={12} /> Panier
              </m.button>
              <button
                onClick={() => remove(item.id)}
                className="flex items-center gap-1.5 px-3 py-2 border border-accent text-xs text-muted hover:text-black hover:border-black transition-colors uppercase tracking-wider"
              >
                <Trash2 size={12} /> Retirer
              </button>
            </div>
          </m.div>
        ))}
      </m.div>
    </div>
  )
}
