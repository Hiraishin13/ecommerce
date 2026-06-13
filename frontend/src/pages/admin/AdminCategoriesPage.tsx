import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { categoryService, type Category } from '../../services/category.service'
import DataTable, { type Column } from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import api from '../../services/api'

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Only lowercase, numbers, hyphens'),
  description: z.string().optional(),
})

type CategoryForm = z.infer<typeof categorySchema>

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) })

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCategories() }, [loadCategories])

  const openCreate = () => {
    setEditingCategory(null)
    reset({ name: '', slug: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    reset({ name: cat.name, slug: cat.slug, description: cat.description || '' })
    setModalOpen(true)
  }

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, data)
        toast.success('Category updated')
      } else {
        await api.post('/categories', data)
        toast.success('Category created')
      }
      setModalOpen(false)
      loadCategories()
    } catch {
      toast.error('Failed to save category')
    }
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? This may affect products.`)) return
    try {
      await api.delete(`/categories/${cat.id}`)
      toast.success('Category deleted')
      loadCategories()
    } catch {
      toast.error('Failed to delete category')
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => {
        const c = row as unknown as Category
        return <span className="text-xs font-bold">{c.name}</span>
      },
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (row) => {
        const c = row as unknown as Category
        return <span className="text-xs text-muted">{c.slug}</span>
      },
    },
    {
      key: 'products_count',
      label: 'Products',
      render: (row) => {
        const c = row as unknown as Category
        return <span className="text-xs">{c.products_count ?? '—'}</span>
      },
    },
    {
      key: 'actions',
      label: '',
      render: (row) => {
        const c = row as unknown as Category
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(c)}
              className="p-1.5 hover:bg-accent transition-colors"
              aria-label="Edit"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => handleDelete(c)}
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
        <h1 className="text-xl font-black uppercase tracking-wider">Categories</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={14} /> Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No categories found."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Slug"
            placeholder="my-category"
            error={errors.slug?.message}
            hint="URL-friendly identifier"
            {...register('slug')}
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
              Description (optional)
            </label>
            <textarea
              className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white resize-none"
              rows={3}
              {...register('description')}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={isSubmitting}>
              {editingCategory ? 'Update' : 'Create'} Category
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
