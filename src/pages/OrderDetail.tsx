import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle, Package, MapPin, ArrowRight } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { fetchWithAuth } from '@/lib/api'
import { API_URLS } from '@/constants/apiUrls'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'

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

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending:  'Menunggu Pembayaran',
  success:  'Lunas',
  failed:   'Gagal',
  expired:  'Kedaluwarsa',
  refunded: 'Dikembalikan',
}

declare global {
  interface Window {
    snap: { pay: (token: string, options: Record<string, unknown>) => void }
  }
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

interface OrderDetail {
  id: string
  order_number: string
  status: string
  total_amount: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  shipping_postal: string
  notes: string | null
  created_at: string
  items: {
    id: string
    product_name: string
    price: number
    quantity: number
    product: { id: string; name: string; image_url: string | null } | null
  }[]
  order_payment: {
    status: string
    payment_method: string | null
    snap_token: string | null
  } | null
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder]     = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying]   = useState(false)
  const snapReady             = useRef(false)
  const payStatus             = searchParams.get('status')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    const load = async () => {
      try {
        const res = await fetchWithAuth(API_URLS.orders.detail(id!))
        const data = await res.json()
        if (data.success) setOrder(data.data)
        else navigate('/orders', { replace: true })
      } finally { setLoading(false) }
    }
    load()

    const existing = document.getElementById('midtrans-snap')
    if (existing) { snapReady.current = true; return }
    const script   = document.createElement('script')
    script.id      = 'midtrans-snap'
    script.src     = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? '')
    script.onload  = () => { snapReady.current = true }
    document.body.appendChild(script)
  }, [isAuthenticated, id])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  }

  if (!order) return null

  const isPending = order.status === 'pending' || order.status === 'awaiting_payment'

  const handlePay = async () => {
    if (!snapReady.current) { toast.error('Payment gateway belum siap. Coba lagi.'); return }
    setPaying(true)
    try {
      const res  = await fetchWithAuth(API_URLS.orders.initiatePayment, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ order_id: order.id }),
      })
      const data = await res.json()
      if (!data.success) { toast.error(data.message ?? 'Gagal memuat pembayaran'); return }
      window.snap.pay(data.data.snap_token, {
        onSuccess: () => navigate(`/orders/${order.id}?status=success`),
        onPending: () => navigate(`/orders/${order.id}?status=pending`),
        onError:   () => navigate(`/orders/${order.id}?status=error`),
        onClose:   () => setPaying(false),
      })
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/"><Logo className="h-10 w-auto" variant="horizontal" /></Link>
          <Link to="/orders" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Riwayat Pesanan</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Payment status banner */}
        {payStatus === 'success' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <div className="font-black text-green-800 text-sm">Pembayaran Berhasil</div>
              <div className="text-xs text-green-600">Pesanan Anda sedang diproses</div>
            </div>
          </motion.div>
        )}
        {payStatus === 'pending' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 mb-6">
            <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
            <div>
              <div className="font-black text-yellow-800 text-sm">Pembayaran Tertunda</div>
              <div className="text-xs text-yellow-600">Selesaikan pembayaran Anda sebelum batas waktu</div>
            </div>
          </motion.div>
        )}
        {payStatus === 'error' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="font-black text-red-800 text-sm">Pembayaran Gagal</div>
              <div className="text-xs text-red-600">Silakan coba lagi</div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{order.order_number}</div>
            <h1 className="text-xl font-black">Detail Pesanan</h1>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-xl border ${STATUS_COLOR[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        <div className="space-y-4">
          {/* Items */}
          <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2 font-black text-sm">
                <Package className="w-4 h-4 text-primary" /> Produk
              </div>
            </div>
            <div className="divide-y divide-black/[0.05]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <img
                    src={item.product?.image_url ?? '/images/products/AFS-vs-PBS.jpg'}
                    alt={item.product_name}
                    className="w-14 h-14 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-black text-sm">{item.product_name}</div>
                    <div className="text-xs text-gray-400">{formatRp(Number(item.price))} × {item.quantity}</div>
                  </div>
                  <div className="font-black text-sm">{formatRp(Number(item.price) * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-black/[0.06] flex justify-between">
              <span className="font-black">Total</span>
              <span className="font-black text-primary">{formatRp(Number(order.total_amount))}</span>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
            <div className="flex items-center gap-2 font-black text-sm mb-3">
              <MapPin className="w-4 h-4 text-primary" /> Alamat Pengiriman
            </div>
            <div className="text-sm text-gray-700 space-y-0.5">
              <div className="font-bold">{order.shipping_name}</div>
              <div className="text-gray-500">{order.shipping_phone}</div>
              <div className="text-gray-500">{order.shipping_address}</div>
              <div className="text-gray-500">{order.shipping_city}, {order.shipping_province} {order.shipping_postal}</div>
            </div>
            {order.notes && <div className="mt-3 text-xs text-gray-400">Catatan: {order.notes}</div>}
          </div>

          {/* Payment info */}
          {order.order_payment && (
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
              <div className="font-black text-sm mb-2">Pembayaran</div>
              <div className="flex gap-4 text-sm">
                <div className="text-gray-500">Status: <span className="font-bold text-gray-900">{PAYMENT_STATUS_LABEL[order.order_payment.status] ?? order.order_payment.status}</span></div>
                {order.order_payment.payment_method && (
                  <div className="text-gray-500">Metode: <span className="font-bold text-gray-900">{order.order_payment.payment_method}</span></div>
                )}
              </div>
            </div>
          )}

          {/* CTA for pending */}
          {isPending && (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {paying
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ArrowRight className="w-4 h-4" /> Selesaikan Pembayaran</>}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
