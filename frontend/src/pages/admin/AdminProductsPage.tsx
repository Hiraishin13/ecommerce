import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Edit2, Trash2, Search, Upload, X, ImageOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { productService, type Product } from '../../services/product.service'
import { categoryService, type Category } from '../../services/category.service'
import { formatPrice } from '../../utils/formatPrice'
import DataTable, { type Column } from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import { useDebounce } from '../../hooks/useDebounce'
import api from '../../services/api'

const productSchema = z.object({
  name:          z.string().min(2, 'Required'),
  slug:          z.string().min(2, 'Required').regex(/^[a-z0-9-]+$/, 'Only lowercase, numbers, hyphens'),
  price:         z.coerce.number().positive('Must be positive'),
  compare_price: z.coerce.number().optional(),
  stock:         z.coerce.number().int().min(0, 'Cannot be negative'),
  description:   z.string().optional(),
  category_id:   z.coerce.number().positive('Select a category'),
  is_featured:   z.boolean().optional(),
  is_active:     z.boolean().optional(),
  sku:           z.string().optional(),
  weight:        z.coerce.number().optional(),
  meta_title:    z.string().optional(),
  meta_desc:     z.string().optional(),
})

type ProductForm = z.infer<typeof productSchema>
type ExtProduct  = Product

export default function AdminProductsPage() {
  const [products, setProducts]             = useState<Product[]>([])
  const [categories, setCategories]         = useState<Category[]>([])
  const [loading, setLoading]               = useState(true)
  const [page, setPage]                     = useState(1)
  const [totalPages, setTotalPages]         = useState(1)
  const [search, setSearch]                 = useState('')
  const debouncedSearch                     = useDebounce(search, 400)
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [images, setImages]                 = useState<string[]>([])
  const [uploading, setUploading]           = useState(false)
  const [showSeo, setShowSeo]               = useState(false)
  const fileInputRef                        = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ProductForm>({ resolver: zodResolver(productSchema) })

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getProducts({ page, limit: 15, ...(debouncedSearch && { search: debouncedSearch }) })
      setProducts(res.products ?? [])
      setTotalPages(res.totalPages ?? 1)
    } catch { setProducts([]) } finally { setLoading(false) }
  }, [page, debouncedSearch])

  useEffect(() => { loadProducts() }, [loadProducts])
  useEffect(() => { categoryService.getCategories().then(setCategories).catch(() => {}) }, [])

  const openCreate = () => {
    setEditingProduct(null)
    setImages([])
    reset({ stock: 0, price: 0, is_active: true, is_featured: false })
    setShowSeo(false)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    const p = product as ExtProduct
    setEditingProduct(product)
    setImages(product.images ?? [])
    reset({
      name:          p.name,
      slug:          p.slug,
      price:         p.price,
      compare_price: p.compare_price,
      stock:         p.stock,
      description:   p.description,
      category_id:   p.category?.id,
      is_featured:   !!p.is_featured,
      is_active:     p.is_active !== 0,
      sku:           p.sku ?? '',
      weight:        p.weight,
      meta_title:    p.meta_title ?? '',
      meta_desc:     p.meta_desc ?? '',
    })
    setShowSeo(false)
    setModalOpen(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url: string = res.data?.url ?? res.data
      setImages((prev) => [...prev, url])
      toast.success('Image uploaded')
    } catch { toast.error('Upload failed') }
    finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = async (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url))
    try { await api.delete('/admin/upload', { data: { url } }) } catch { /* non-critical */ }
  }

  const onSubmit = async (data: ProductForm) => {
    try {
      const payload = { ...data, images, is_active: data.is_active ? 1 : 0, is_featured: data.is_featured ? 1 : 0 }
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload)
        toast.success('Product updated')
      } else {
        await api.post('/admin/products', payload)
        toast.success('Product created')
      }
      setModalOpen(false)
      loadProducts()
    } catch { toast.error('Failed to save product') }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return
    try {
      await api.delete(`/admin/products/${product.id}`)
      toast.success('Product deleted')
      loadProducts()
    } catch { toast.error('Failed to delete product') }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (row) => {
        const p = row as unknown as Product
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent flex-shrink-0 overflow-hidden">
              {p.images?.[0]
                ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><ImageOff size={14} className="text-muted" /></div>
              }
            </div>
            <div>
              <p className="text-xs font-bold">{p.name}</p>
              <p className="text-xs text-muted">{p.slug}</p>
            </div>
          </div>
        )
      },
    },
    { key: 'category', label: 'Category', render: (row) => <span className="text-xs">{(row as unknown as Product).category?.name || '—'}</span> },
    { key: 'price',    label: 'Price',    render: (row) => <span className="text-xs font-bold">{formatPrice((row as unknown as Product).price)}</span> },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => {
        const p = row as unknown as Product
        return <span className={`text-xs font-bold ${p.stock === 0 ? 'text-[#D32F2F]' : p.stock <= 5 ? 'text-[#F57C00]' : ''}`}>{p.stock}</span>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const p = row as unknown as ExtProduct
        return (
          <div className="flex flex-col gap-0.5">
            {p.is_active === 0 && <span className="text-xs text-[#D32F2F] font-bold uppercase tracking-wider">Inactive</span>}
            {!!p.is_featured    && <span className="text-xs text-[#1565C0] font-bold uppercase tracking-wider">Featured</span>}
            {p.is_active !== 0 && !p.is_featured && <span className="text-xs text-[#388E3C]">Active</span>}
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: '',
      render: (row) => {
        const p = row as unknown as Product
        return (
          <div className="flex items-center gap-2">
            <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-accent transition-colors" aria-label="Edit"><Edit2 size={14} /></button>
            <button onClick={() => handleDelete(p)} className="p-1.5 hover:bg-accent transition-colors text-[#D32F2F]" aria-label="Delete"><Trash2 size={14} /></button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">Products</h1>
        <Button onClick={openCreate} size="sm"><Plus size={14} /> Add Product</Button>
      </div>

      <div className="mb-4 max-w-xs">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." icon={<Search size={14} />} />
      </div>

      <DataTable columns={columns} data={products as unknown as Record<string, unknown>[]} loading={loading} emptyMessage="No products found." />

      <div className="mt-4 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'New Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── Images ── */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Images</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((url) => (
                <div key={url} className="relative group w-20 h-20 flex-shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover border border-accent" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D32F2F] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 border-2 border-dashed border-accent flex flex-col items-center justify-center gap-1 hover:border-black transition-colors text-muted hover:text-black disabled:opacity-50"
              >
                <Upload size={16} />
                <span className="text-[10px] uppercase tracking-wider">{uploading ? '...' : 'Upload'}</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} />
          </div>

          {/* ── Core fields ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Product Name" error={errors.name?.message} {...register('name')} /></div>
            <Input label="Slug (URL)" error={errors.slug?.message} {...register('slug')} placeholder="my-product" />
            <Input label="SKU" {...register('sku')} placeholder="SKU-001" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Price (€)" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
            <Input label="Compare Price (€)" type="number" step="0.01" {...register('compare_price')} />
            <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Category</label>
            <select className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white" {...register('category_id')}>
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-[#D32F2F]">{errors.category_id.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Description</label>
            <textarea className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white resize-none" rows={3} {...register('description')} />
          </div>

          {/* ── Toggles ── */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 accent-black" {...register('is_active')} />
              <span className="text-xs font-bold uppercase tracking-wider">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 accent-black" {...register('is_featured')} />
              <span className="text-xs font-bold uppercase tracking-wider">Featured</span>
            </label>
          </div>

          {/* ── SEO collapsed ── */}
          <div>
            <button type="button" onClick={() => setShowSeo((v) => !v)} className="text-xs text-muted hover:text-black uppercase tracking-wider font-bold transition-colors">
              {showSeo ? '− ' : '+ '}SEO &amp; Advanced
            </button>
            {showSeo && (
              <div className="mt-3 space-y-3 border-l-2 border-accent pl-4">
                <Input label="Weight (kg)" type="number" step="0.01" {...register('weight')} />
                <Input label="Meta Title" {...register('meta_title')} />
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Meta Description</label>
                  <textarea className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white resize-none" rows={2} {...register('meta_desc')} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>{editingProduct ? 'Update' : 'Create'} Product</Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
