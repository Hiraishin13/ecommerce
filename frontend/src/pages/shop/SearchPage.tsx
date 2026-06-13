import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { productService, type Product } from '../../services/product.service'
import ProductCard from '../../components/common/ProductCard'
import SkeletonCard from '../../components/common/SkeletonCard'
import Pagination from '../../components/ui/Pagination'
import Input from '../../components/ui/Input'
import { useDebounce } from '../../hooks/useDebounce'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 400)
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    const p = new URLSearchParams(searchParams)
    if (debouncedQuery) p.set('q', debouncedQuery)
    else p.delete('q')
    p.set('page', '1')
    setSearchParams(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    if (!q) {
      setProducts([])
      setTotal(0)
      return
    }
    setLoading(true)
    productService
      .searchProducts(q, { page })
      .then((res) => {
        setProducts(res.data)
        setTotal(res.meta.total)
        setTotalPages(res.meta.last_page)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [searchParams, page])

  const handlePageChange = (pg: number) => {
    const p = new URLSearchParams(searchParams)
    p.set('page', String(pg))
    setSearchParams(p)
  }

  const q = searchParams.get('q') || ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-black uppercase tracking-wider mb-8">Search</h1>

      {/* Search input */}
      <div className="max-w-xl mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          icon={<Search size={16} />}
          className="text-base py-4"
          autoFocus
        />
      </div>

      {/* Results header */}
      {q && !loading && (
        <p className="text-sm text-muted mb-6">
          {total} {total === 1 ? 'result' : 'results'} for &ldquo;<strong className="text-black">{q}</strong>&rdquo;
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !q ? (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto text-accent mb-4" />
          <p className="text-sm text-muted uppercase tracking-wider">
            Type something to search
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-bold uppercase tracking-wider mb-2">No Results</p>
          <p className="text-sm text-muted">
            We couldn&apos;t find anything for &ldquo;{q}&rdquo;
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}
