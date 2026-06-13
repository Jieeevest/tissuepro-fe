import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Loader2 } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { useCart } from '@/store/useCart'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

function formatRp(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export default function Cart() {
  const { isAuthenticated } = useAuth()
  const { items, total, loading, pendingItemIds, fetch, updateItem, removeItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?next=/cart', { replace: true }); return }
    fetch()
  }, [isAuthenticated])

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/"><Logo className="h-10 w-auto" variant="horizontal" /></Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Lanjut Belanja</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black">Keranjang Belanja</h1>
          {items.length > 0 && (
            <span className="text-sm text-gray-400 font-semibold">({items.length} item)</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h2 className="text-lg font-black text-gray-400 mb-2">Keranjang masih kosong</h2>
              <p className="text-sm text-gray-400 mb-6">Tambahkan produk dari katalog kami</p>
              <Link
                to="/#produk"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Lihat Produk <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="filled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Cart items */}
              <div className="md:col-span-2 space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const isSyncing = pendingItemIds.includes(item.id)
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border border-black/[0.08] rounded-2xl p-4 flex gap-4"
                      >
                        <img
                          src={item.product.image_url ?? '/images/products/AFS-vs-PBS.jpg'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-primary uppercase tracking-wider mb-0.5">
                            {item.product.series}
                          </div>
                          <h3 className="font-black text-sm text-gray-900">{item.product.name}</h3>
                          <div className="text-sm font-bold text-gray-900 mt-1">
                            {item.product.price
                              ? formatRp(item.product.price)
                              : <span className="text-gray-400 text-xs">Harga belum tersedia</span>}
                          </div>
                          {item.product.price && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              Subtotal: <span className="font-bold text-gray-700">{formatRp(item.product.price * item.quantity)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) updateItem(item.id, item.quantity - 1)
                                else removeItem(item.id)
                              }}
                              className="w-7 h-7 rounded-lg border border-black/[0.10] flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <div className={cn('w-7 text-center', isSyncing && 'opacity-50')}>
                              {isSyncing
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary mx-auto" />
                                : <span className="text-sm font-black">{item.quantity}</span>}
                            </div>
                            <button
                              onClick={() => updateItem(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg border border-black/[0.10] flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Order summary */}
              <div className="md:col-span-1">
                <div className="bg-white border border-black/[0.08] rounded-2xl p-5 sticky top-6">
                  <h2 className="font-black text-base mb-4">Ringkasan Pesanan</h2>
                  <div className="space-y-2 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-500">
                        <span className="truncate flex-1 mr-2">{item.product.name} ×{item.quantity}</span>
                        <span className="font-semibold shrink-0">
                          {item.product.price ? formatRp(item.product.price * item.quantity) : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-black/[0.06] pt-3 mb-5 flex justify-between">
                    <span className="font-black">Total</span>
                    <span className="font-black text-primary text-lg">{formatRp(total)}</span>
                  </div>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Lanjut ke Pembayaran <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/"
                    className="block text-center mt-3 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    + Tambah produk lain
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
