import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id:            number
  name:          string
  slug:          string
  price:         number
  compare_price?: number | null
  image?:        string | null
}

interface WishlistState {
  items: WishlistItem[]
  toggle:  (item: WishlistItem) => void
  has:     (id: number) => boolean
  remove:  (id: number) => void
  clear:   () => void
  count:   () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id)
          return {
            items: exists
              ? state.items.filter((i) => i.id !== item.id)
              : [...state.items, item],
          }
        }),

      has:    (id) => get().items.some((i) => i.id === id),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear:  ()   => set({ items: [] }),
      count:  ()   => get().items.length,
    }),
    {
      name: 'wishlist-storage',
    }
  )
)
