import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService, type Product } from '../../services/product.service'
import { useCartStore } from '../../store/cartStore'
import { formatPrice, formatDiscount } from '../../utils/formatPrice'
import Breadcrumb from '../../components/common/Breadcrumb'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

type Tab = 'description' | 'details' | 'shipping'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageIdx, setImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [tab, setTab] = useState<Tab>('description')

  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productService
      .getProduct(slug)
      .then((p) => { setProduct(p); setError(false) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return
    setAdding(true)
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
      slug: product.slug,
    })
    toast.success(`${product.name} added to cart`)
    setAdding(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4">Product Not Found</h2>
        <Link to="/products">
          <Button variant="secondary">Back to Products</Button>
        </Link>
      </div>
    )
  }

  const discount = formatDiscount(product.price, product.compare_price ?? 0)
  const images = product.images.length > 0 ? product.images : [null]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.category?.name || 'Category', href: `/products?category=${product.category?.slug}` },
          { label: product.name },
        ]}
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image gallery */}
        <div>
          {/* Main image */}
          <div className="relative aspect-square bg-accent overflow-hidden mb-3">
            {images[imageIdx] ? (
              <img
                src={images[imageIdx]!}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm uppercase tracking-wider">
                No Image
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-2 hover:bg-accent transition-colors shadow"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setImageIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-2 hover:bg-accent transition-colors shadow"
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIdx(idx)}
                  className={`w-16 h-16 flex-shrink-0 bg-accent overflow-hidden border-2 transition-colors ${
                    idx === imageIdx ? 'border-black' : 'border-transparent'
                  }`}
                >
                  {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {/* Category */}
          <p className="text-xs text-muted uppercase tracking-widest mb-2">
            {product.category?.name}
          </p>

          {/* Name */}
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">{product.name}</h1>

          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {discount > 0 && <Badge variant="SALE" label={`-${discount}%`} />}
            {product.is_featured && <Badge variant="NEW" />}
            {product.stock === 0 ? (
              <Badge variant="OUT_OF_STOCK" />
            ) : product.stock <= 5 ? (
              <Badge color="orange" label={`Only ${product.stock} left`} />
            ) : (
              <Badge color="green" label="In Stock" />
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-black">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-base text-muted line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {product.stock > 0 ? (
            <div className="flex gap-3 mb-8">
              {/* Quantity selector */}
              <div className="flex border border-accent">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-accent transition-colors text-sm font-bold"
                >
                  −
                </button>
                <span className="px-4 py-2 flex items-center text-sm font-bold min-w-[3rem] justify-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 hover:bg-accent transition-colors text-sm font-bold"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                loading={adding}
                className="flex-1"
                size="lg"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </Button>
            </div>
          ) : (
            <div className="mb-8">
              <Button disabled variant="secondary" size="lg" fullWidth>
                Out of Stock
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-accent mb-6" />

          {/* Tabs */}
          <div>
            <div className="flex border-b border-accent mb-4">
              {(['description', 'details', 'shipping'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    tab === t
                      ? 'border-b-2 border-black text-black -mb-px'
                      : 'text-muted hover:text-black'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'description' && (
              <div className="text-sm text-[#1A1A1A] leading-relaxed">
                {product.description || 'No description available.'}
              </div>
            )}
            {tab === 'details' && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-accent">
                  <span className="text-muted uppercase tracking-wider text-xs">SKU</span>
                  <span className="font-medium">#{product.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-accent">
                  <span className="text-muted uppercase tracking-wider text-xs">Category</span>
                  <span className="font-medium">{product.category?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-accent">
                  <span className="text-muted uppercase tracking-wider text-xs">Stock</span>
                  <span className="font-medium">{product.stock} units</span>
                </div>
              </div>
            )}
            {tab === 'shipping' && (
              <div className="text-sm text-[#1A1A1A] leading-relaxed space-y-2">
                <p>Free shipping on orders over €50.</p>
                <p>Standard delivery: 3–5 business days.</p>
                <p>Express delivery: 1–2 business days (extra charge).</p>
                <p>Easy 30-day returns on all items.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
