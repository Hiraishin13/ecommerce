import api from './api'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: number
  products_count?: number
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<{ categories: Category[] }>('/categories')
    return data.categories ?? []
  },

  async getCategory(slug: string): Promise<Category> {
    const { data } = await api.get<{ category: Category }>(`/categories/${slug}`)
    return data.category
  },
}
