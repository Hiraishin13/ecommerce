import api from './api'

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku?: string
  unit_price: number
  quantity: number
  subtotal: number
}

export interface ShippingAddress {
  name: string
  street: string
  city: string
  zip: string
  country: string
  phone?: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: number
  order_number: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping_fee: number
  total: number
  payment_method?: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateOrderPayload {
  shipping_name: string
  shipping_email: string
  shipping_phone?: string
  shipping_address: string
  shipping_city: string
  shipping_zip: string
  shipping_country: string
  payment_method: string
  notes?: string
}

export interface PaginatedOrders {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

export const orderService = {
  async getOrders(page = 1): Promise<PaginatedOrders> {
    const { data } = await api.get<{
      orders: Order[]
      total: number
      pagination: { page: number; total_pages: number; limit: number }
    }>('/me/orders', { params: { page } })
    return {
      orders: data.orders ?? [],
      total: data.total ?? 0,
      page: data.pagination?.page ?? 1,
      totalPages: data.pagination?.total_pages ?? 1,
    }
  },

  async getOrder(id: number): Promise<Order> {
    const { data } = await api.get<{ order: Order }>(`/me/orders/${id}`)
    return data.order
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<{ order: Order }>('/orders', payload)
    return data.order
  },

  async cancelOrder(id: number): Promise<Order> {
    const { data } = await api.post<{ order: Order }>(`/orders/${id}/cancel`)
    return data.order
  },
}
