import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import { productService, type Product, type ProductFilters } from '../../services/product.service'
import { categoryService, type Category } from '../../services/category.service'
import ProductCard from '../../components/common/ProductCard'
import SkeletonCard from '../../components/common/SkeletonCard'
import Pagination from '../../components/ui/Pagination'
import Breadcrumb from '../../components/common/Breadcrumb'
import Input from '../../components/ui/Input'
import { useDebounce } from '../../hooks/useDebounce'
import { cn } from '../../utils/cn'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchInput, 400)

  const page = Number(searchParams.get('page') || 1)
  const category = searchParams.get('category') || ''
  const sort = (searchParams.get('sort') || 'newest') as ProductFilters['sort']
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    if (key !== 'page') p.set('page', '1')
    setSearchParams(p)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const filters: ProductFilters = {
        page,
        per_page: 12,
        sort,
        ...(category && { category }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(minPrice && { min_price: Number(minPrice) }),
        ...(maxPrice && { max_price: Number(maxPrice) }),
      }
      const res = await productService.getProducts(filters)
      setProducts(res.data)
      setTotalPages(res.meta.last_page)
      setTotal(res.meta.total)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, sort, category, debouncedSearch, minPrice, maxPrice])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {})
  }, [])

  // Sync debouncedSearch -> searchParams
  useEffect(() => {
    updateParam('search', debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const hasFilters = !!(category || minPrice || maxPrice || debouncedSearch)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider">Products</h1>
          {!loading && (
            <p className="text-xs text-muted mt-1">{total} {total === 1 ? 'item' : 'items'}</p>
          )}
        </div>
        <button
          className="md:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-black px-3 py-2"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside
          className={cn(
            'w-56 flex-shrink-0',
            'hidden md:block',
            filtersOpen && '!block fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:relative md:p-0 md:z-auto'
          )}
        >
          {filtersOpen && (
            <button
              className="md:hidden flex items-center gap-1 mb-4 text-xs font-bold uppercase tracking-wider"
              onClick={() => setFiltersOpen(false)}
            >
              <X size={14} /> Close Filters
            </button>
          )}

          {/* Search */}
          <div className="mb-6">
            <Input
              label="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              icon={<Search size={14} />}
            />
          </div>

          {/* Sort */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Sort By</label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full border border-accent px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider mb-3">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={cn(
                    'block w-full text-left text-xs px-2 py-1.5 transition-colors',
                    !category ? 'font-bold' : 'text-muted hover:text-black'
                  )}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('category', c.slug)}
                    className={cn(
                      'block w-full text-left text-xs px-2 py-1.5 transition-colors',
                      category === c.slug ? 'font-bold' : 'text-muted hover:text-black'
                    )}
                  >
                    {c.name}
                    {c.products_count !== undefined && (
                      <span className="ml-1 text-muted">({c.products_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider mb-3">Price Range (€)</p>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={minPrice}
                onChange={(e) => updateParam('min_price', e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Max"
                type="number"
                value={maxPrice}
                onChange={(e) => updateParam('max_price', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold uppercase tracking-wider text-muted hover:text-black transition-colors flex items-center gap-1"
            >
              <X size={12} /> Clear Filters
            </button>
          )}
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-bold uppercase tracking-wider mb-2">No Products Found</p>
              <p className="text-sm text-muted mb-6">Try adjusting your filters.</p>
              <button
                onClick={clearFilters}
                className="text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(pg) => updateParam('page', String(pg))}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
