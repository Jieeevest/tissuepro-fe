import { create } from 'zustand'
import { API_URLS } from '@/constants/apiUrls'
import { fetchWithAuth } from '@/lib/api'
import { toast } from 'sonner'

export interface CartProduct {
  id: string
  name: string
  series: string
  price: number | null
  image_url: string | null
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  product: CartProduct
  quantity: number
}

const updateTimers = new Map<string, ReturnType<typeof setTimeout>>()

function computeTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0)
}

interface CartState {
  items: CartItem[]
  total: number
  loading: boolean
  pendingItemIds: string[]
  addingProductIds: string[]
  fetch: () => Promise<void>
  addItem: (product_id: string, quantity?: number) => Promise<void>
  updateItem: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => Promise<void>
  reset: () => void
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  pendingItemIds: [],
  addingProductIds: [],

  fetch: async () => {
    set({ loading: true })
    try {
      const res = await fetchWithAuth(API_URLS.cart.get)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          const items: CartItem[] = data.data.items ?? []
          set({ items, total: computeTotal(items) })
        }
      }
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (product_id, quantity = 1) => {
    set(s => ({ addingProductIds: [...s.addingProductIds, product_id] }))
    try {
      await fetchWithAuth(API_URLS.cart.addItem, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id, quantity }),
      })
      await get().fetch()
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    } finally {
      set(s => ({ addingProductIds: s.addingProductIds.filter(id => id !== product_id) }))
    }
  },

  updateItem: (id, quantity) => {
    set(s => {
      const items = s.items.map(item => item.id === id ? { ...item, quantity } : item)
      return { items, total: computeTotal(items) }
    })

    const existing = updateTimers.get(id)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(async () => {
      updateTimers.delete(id)
      set(s => ({ pendingItemIds: [...s.pendingItemIds, id] }))
      try {
        await fetchWithAuth(API_URLS.cart.updateItem(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        })
      } catch {
        await get().fetch()
        toast.error('Gagal memperbarui jumlah')
      } finally {
        set(s => ({ pendingItemIds: s.pendingItemIds.filter(pid => pid !== id) }))
      }
    }, 600)

    updateTimers.set(id, timer)
  },

  removeItem: (id) => {
    set(s => {
      const items = s.items.filter(item => item.id !== id)
      return { items, total: computeTotal(items) }
    })
    fetchWithAuth(API_URLS.cart.deleteItem(id), { method: 'DELETE' }).catch(async () => {
      await get().fetch()
      toast.error('Gagal menghapus item')
    })
  },

  clear: async () => {
    updateTimers.clear()
    set({ items: [], total: 0 })
    await fetchWithAuth(API_URLS.cart.clear, { method: 'DELETE' })
  },

  reset: () => {
    updateTimers.clear()
    set({ items: [], total: 0, loading: false, pendingItemIds: [], addingProductIds: [] })
  },
}))
