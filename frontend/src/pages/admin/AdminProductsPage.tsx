import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
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
  name: z.string().min(2, 'Required'),
  slug: z.string().min(2, 'Required').regex(/^[a-z0-9-]+$/, 'Only lowercase, numbers, hyphens'),
  price: z.coerce.number().positive('Must be positive'),
  compare_price: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0, 'Cannot be negative'),
  description: z.string().optional(),
  category_id: z.coerce.number().positive('Select a category'),
})

type ProductForm = z.infer<typeof productSchema>

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) })

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getProducts({
        page,
        per_page: 15,
        ...(debouncedSearch && { search: debouncedSearch }),
      })
      setProducts(res.products ?? [])
      setTotalPages(res.totalPages ?? 1)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { loadProducts() }, [loadProducts])
  useEffect(() => { categoryService.getCategories().then(setCategories).catch(() => {}) }, [])

  const openCreate = () => {
    setEditingProduct(null)
    reset({ stock: 0, price: 0 })
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    reset({
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_price: product.compare_price,
      stock: product.stock,
      description: product.description,
      category_id: product.category?.id,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: ProductForm) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data)
        toast.success('Product updated')
      } else {
        await api.post('/products', data)
        toast.success('Product created')
      }
      setModalOpen(false)
      loadProducts()
    } catch {
      toast.error('Failed to save product')
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return
    try {
      await api.delete(`/products/${product.id}`)
      toast.success('Product deleted')
      loadProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (row) => {
        const p = row as unknown as Product
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent flex-shrink-0">
              {p.images?.[0] && (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold">{p.name}</p>
              <p className="text-xs text-muted">{p.slug}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => {
        const p = row as unknown as Product
        return <span className="text-xs">{p.category?.name || '—'}</span>
      },
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => {
        const p = row as unknown as Product
        return <span className="text-xs font-bold">{formatPrice(p.price)}</span>
      },
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (row) => {
        const p = row as unknown as Product
        return (
          <span className={`text-xs font-bold ${p.stock === 0 ? 'text-[#D32F2F]' : p.stock <= 5 ? 'text-[#F57C00]' : ''}`}>
            {p.stock}
          </span>
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
            <button
              onClick={() => openEdit(p)}
              className="p-1.5 hover:bg-accent transition-colors"
              aria-label="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => handleDelete(p)}
              className="p-1.5 hover:bg-accent transition-colors text-[#D32F2F]"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">Products</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={14} /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-xs">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          icon={<Search size={14} />}
        />
      </div>

      <DataTable
        columns={columns}
        data={products as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No products found."
      />

      <div className="mt-4 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Product Name" error={errors.name?.message} {...register('name')} />
          <Input label="Slug (URL)" error={errors.slug?.message} {...register('slug')} placeholder="my-product" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (€)" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
            <Input label="Compare Price (€)" type="number" step="0.01" error={errors.compare_price?.message} {...register('compare_price')} />
          </div>
          <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Category</label>
            <select
              className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
              {...register('category_id')}
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-xs text-[#D32F2F]">{errors.category_id.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white resize-none"
              rows={3}
              {...register('description')}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
