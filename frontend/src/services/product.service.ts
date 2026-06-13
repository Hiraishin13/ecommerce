import api from './api'

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  compare_price?: number
  stock: number
  images: string[]
  sku?: string
  is_featured: number
  is_active: number
  category_id?: number
  category_name?: string
  category_slug?: string
  created_at: string
}

export interface ProductFilters {
  category_id?: number
  min_price?: number
  max_price?: number
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page?: number
  limit?: number
  search?: string
  is_featured?: number
}

interface BackendPagination {
  products: Product[]
  total: number
  pagination: {
    page: number
    limit: number
    total_pages: number
  }
}

export interface PaginatedProducts {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<PaginatedProducts> {
    const { data } = await api.get<BackendPagination>('/products', { params: filters })
    return {
      products: data.products ?? [],
      total: data.total ?? 0,
      page: data.pagination?.page ?? 1,
      totalPages: data.pagination?.total_pages ?? 1,
    }
  },

  async getProduct(slug: string): Promise<Product> {
    const { data } = await api.get<{ product: Product }>(`/products/${slug}`)
    return data.product
  },

  async searchProducts(q: string, filters?: ProductFilters): Promise<PaginatedProducts> {
    const { data } = await api.get<BackendPagination>('/products/search', {
      params: { q, ...filters },
    })
    return {
      products: data.products ?? [],
      total: data.total ?? 0,
      page: 1,
      totalPages: 1,
    }
  },

  async getFeatured(): Promise<Product[]> {
    const { data } = await api.get<{ products: Product[] }>('/products/featured')
    return data.products ?? []
  },

  async getBestsellers(): Promise<Product[]> {
    const { data } = await api.get<{ products: Product[] }>('/products/bestsellers')
    return data.products ?? []
  },
}
