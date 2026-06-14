import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { m } from 'framer-motion'
import { productService, type Product } from '../services/product.service'
import { categoryService, type Category } from '../services/category.service'
import ProductCard from '../components/common/ProductCard'
import SkeletonCard from '../components/common/SkeletonCard'
import Button from '../components/ui/Button'
import { stagger, staggerItem } from '../utils/motion'

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [f, b, c] = await Promise.allSettled([
          productService.getFeatured(),
          productService.getBestsellers(),
          categoryService.getCategories(),
        ])
        if (f.status === 'fulfilled') setFeatured(f.value.slice(0, 4))
        if (b.status === 'fulfilled') setBestsellers(b.value.slice(0, 4))
        if (c.status === 'fulfilled') setCategories(c.value.slice(0, 6))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div
            className="py-28 md:py-40 max-w-2xl"
            variants={stagger(0.08)}
            initial="hidden"
            animate="visible"
          >
            <m.p variants={staggerItem} className="text-xs font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
              New Collection 2026
            </m.p>
            <m.h1 variants={staggerItem} className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6">
              DEFINE YOUR STYLE
            </m.h1>
            <m.p variants={staggerItem} className="text-base text-white/70 mb-10 max-w-md leading-relaxed">
              Minimal design. Maximum quality. Discover our curated collection of premium products.
            </m.p>
            <m.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="border-white text-white hover:bg-white hover:text-black">
                  Shop Now
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="ghost" className="text-white border-white/30 hover:border-white">
                  Explore
                </Button>
              </Link>
            </m.div>
          </m.div>
        </div>
        {/* Decorative stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10" />
      </section>

      {/* Categories */}
      {(categories.length > 0 || loading) && (
        <section className="py-16 bg-[#F5F5F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title">Shop by Category</h2>
              <Link
                to="/products"
                className="text-xs font-bold uppercase tracking-widest text-muted hover:text-black transition-colors flex items-center gap-1"
              >
                All Products <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-accent mb-2" />
                      <div className="h-3 bg-accent rounded w-2/3 mx-auto" />
                    </div>
                  ))
                : categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="group text-center"
                    >
                      <div className="aspect-square bg-accent overflow-hidden mb-2 group-hover:bg-black transition-colors duration-300 flex items-center justify-center">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <span className="text-2xl font-black text-black/20 group-hover:text-white/20 transition-colors uppercase">
                            {cat.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">{cat.name}</p>
                      {cat.products_count !== undefined && (
                        <p className="text-xs text-muted mt-0.5">{cat.products_count} items</p>
                      )}
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Featured</h2>
            <Link
              to="/products"
              className="text-xs font-bold uppercase tracking-widest text-muted hover:text-black transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <m.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={stagger(0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.length > 0
              ? featured.map((p) => <ProductCard key={p.id} product={p} />)
              : (
                <div className="col-span-4 text-center py-16 text-muted text-sm">
                  No featured products yet.
                </div>
              )}
          </m.div>
        </div>
      </section>

      {/* Banner strip */}
      <section className="py-12 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: 'Free Shipping', desc: 'On orders over €50' },
              { title: 'Easy Returns', desc: '30-day return policy' },
              { title: 'Secure Payment', desc: 'Encrypted & safe checkout' },
            ].map((item) => (
              <div key={item.title}>
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-1">{item.title}</p>
                <p className="text-xs text-white/60 uppercase tracking-wider">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Bestsellers</h2>
            <Link
              to="/products?sort=popular"
              className="text-xs font-bold uppercase tracking-widest text-muted hover:text-black transition-colors flex items-center gap-1"
            >
              See More <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.length > 0
              ? bestsellers.map((p) => <ProductCard key={p.id} product={p} />)
              : (
                <div className="col-span-4 text-center py-16 text-muted text-sm">
                  No bestsellers yet.
                </div>
              )}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 bg-white border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Ready to Shop?
          </h2>
          <p className="text-sm text-muted mb-8 max-w-md mx-auto">
            Discover our full collection and find something you love.
          </p>
          <Link to="/products">
            <Button size="lg">
              Browse All Products <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
