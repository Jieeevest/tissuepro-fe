import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { fetchWithAuth } from '@/lib/api'
import { API_URLS } from '@/constants/apiUrls'
import { Logo } from '@/components/Logo'

const STATUS_LABEL: Record<string, string> = {
  pending:          'Menunggu Pembayaran',
  awaiting_payment: 'Menunggu Pembayaran',
  paid:             'Sudah Dibayar',
  processing:       'Diproses',
  shipped:          'Dikirim',
  delivered:        'Selesai',
  cancelled:        'Dibatalkan',
}

const STATUS_COLOR: Record<string, string> = {
  pending:          'bg-yellow-50 text-yellow-700 border-yellow-200',
  awaiting_payment: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid:             'bg-green-50 text-green-700 border-green-200',
  processing:       'bg-blue-50 text-blue-700 border-blue-200',
  shipped:          'bg-purple-50 text-purple-700 border-purple-200',
  delivered:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:        'bg-red-50 text-red-600 border-red-200',
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

interface OrderSummary {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  items: { product_name: string; quantity: number }[]
  order_payment: { status: string; payment_method: string | null } | null
}

export default function Orders() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    const load = async () => {
      try {
        const res = await fetchWithAuth(API_URLS.orders.list)
        const data = await res.json()
        if (data.success) setOrders(data.data)
      } finally { setLoading(false) }
    }
    load()
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/"><Logo className="h-10 w-auto" variant="horizontal" /></Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Beranda</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black">Riwayat Pesanan</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-black text-gray-400 mb-2">Belum ada pesanan</h2>
            <Link to="/#produk" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm mt-2">
              Mulai Berbelanja
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/orders/${order.id}`}
                  className="block bg-white border border-black/[0.08] rounded-2xl p-5 hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                          {order.order_number}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${STATUS_COLOR[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-gray-900">{formatRp(Number(order.total_amount))}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
