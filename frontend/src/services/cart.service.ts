import api from './api'

export interface ServerCartItem {
  id: number
  product_id: number
  product_name: string
  product_slug: string
  unit_price: number
  quantity: number
  subtotal: number
  images?: string[]
}

export interface ServerCart {
  items: ServerCartItem[]
  subtotal: number
  total: number
}

export const cartService = {
  async getCart(): Promise<ServerCart> {
    const { data } = await api.get<{ cart: ServerCart }>('/cart')
    return data.cart ?? { items: [], subtotal: 0, total: 0 }
  },

  async addToCart(productId: number, quantity: number): Promise<ServerCart> {
    const { data } = await api.post<{ cart: ServerCart }>('/cart/items', { product_id: productId, quantity })
    return data.cart ?? { items: [], subtotal: 0, total: 0 }
  },

  async updateCartItem(itemId: number, quantity: number): Promise<ServerCart> {
    const { data } = await api.put<{ cart: ServerCart }>(`/cart/items/${itemId}`, { quantity })
    return data.cart ?? { items: [], subtotal: 0, total: 0 }
  },

  async removeFromCart(itemId: number): Promise<ServerCart> {
    const { data } = await api.delete<{ cart: ServerCart }>(`/cart/items/${itemId}`)
    return data.cart ?? { items: [], subtotal: 0, total: 0 }
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart')
  },
}
