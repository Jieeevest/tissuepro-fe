import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, ShoppingBag, AlertTriangle, CreditCard } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { useCart, CartItem } from '@/store/useCart'
import { fetchWithAuth } from '@/lib/api'
import { API_URLS } from '@/constants/apiUrls'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'

declare global {
  interface Window {
    snap: {
      pay:   (token: string, options: SnapCallbacks) => void
      embed: (token: string, options: SnapCallbacks & { embedId: string }) => void
    }
  }
}

interface SnapCallbacks {
  onSuccess: (result: unknown) => void
  onPending: (result: unknown) => void
  onError:   (result: unknown) => void
  onClose:   () => void
}

const PAYMENT_METHODS = [
  {
    label: 'QRIS',
    bg: '#E2001A',
    logo: (
      <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
        <rect x="4" y="4" width="14" height="14" rx="2" fill="white"/>
        <rect x="6" y="6" width="10" height="10" rx="1" fill="#E2001A"/>
        <rect x="8" y="8" width="6" height="6" rx="0.5" fill="white"/>
        <rect x="22" y="4" width="14" height="14" rx="2" fill="white"/>
        <rect x="24" y="6" width="10" height="10" rx="1" fill="#E2001A"/>
        <rect x="26" y="8" width="6" height="6" rx="0.5" fill="white"/>
        <rect x="4" y="22" width="14" height="14" rx="2" fill="white"/>
        <rect x="6" y="24" width="10" height="10" rx="1" fill="#E2001A"/>
        <rect x="8" y="26" width="6" height="6" rx="0.5" fill="white"/>
        <rect x="22" y="22" width="4" height="4" rx="0.5" fill="white"/>
        <rect x="28" y="22" width="4" height="4" rx="0.5" fill="white"/>
        <rect x="34" y="22" width="2" height="2" rx="0.3" fill="white"/>
        <rect x="22" y="28" width="6" height="2" rx="0.5" fill="white"/>
        <rect x="30" y="26" width="6" height="4" rx="0.5" fill="white"/>
        <rect x="22" y="32" width="4" height="4" rx="0.5" fill="white"/>
        <rect x="28" y="34" width="8" height="2" rx="0.5" fill="white"/>
      </svg>
    ),
  },
  {
    label: 'GoPay',
    bg: '#00880A',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="12" fill="white"/>
        <path d="M20 11a9 9 0 1 0 9 9h-9V11z" fill="#00880A"/>
        <path d="M21 14v6h6a6 6 0 0 0-6-6z" fill="#00880A" opacity=".5"/>
      </svg>
    ),
  },
  {
    label: 'ShopeePay',
    bg: '#EE4D2D',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <path d="M20 8c-2.5 0-4.5 2-4.5 4.5 0 1 .3 1.9.8 2.6H12a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2h-4.3c.5-.7.8-1.6.8-2.6C24.5 10 22.5 8 20 8zm0 2c1.4 0 2.5 1.1 2.5 2.5S21.4 15 20 15s-2.5-1.1-2.5-2.5S18.6 10 20 10zm-2 12h4v2h-4v-2z" fill="white"/>
      </svg>
    ),
  },
  {
    label: 'OVO',
    bg: '#4C3494',
    logo: (
      <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="800" fontFamily="Arial, sans-serif">OVO</text>
      </svg>
    ),
  },
  {
    label: 'Transfer Bank',
    bg: '#1565C0',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <rect x="8" y="18" width="4" height="12" rx="1" fill="white"/>
        <rect x="14" y="14" width="4" height="16" rx="1" fill="white"/>
        <rect x="20" y="18" width="4" height="12" rx="1" fill="white"/>
        <rect x="26" y="12" width="4" height="18" rx="1" fill="white"/>
        <rect x="7" y="30" width="26" height="2" rx="1" fill="white"/>
        <path d="M20 8l12 6H8l12-6z" fill="white"/>
      </svg>
    ),
  },
  {
    label: 'Kartu Kredit',
    bg: '#1A1F71',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <rect x="6" y="12" width="28" height="18" rx="3" fill="white" opacity=".2"/>
        <rect x="6" y="12" width="28" height="18" rx="3" stroke="white" strokeWidth="1.5"/>
        <rect x="6" y="17" width="28" height="5" fill="white" opacity=".4"/>
        <rect x="10" y="24" width="8" height="2" rx="1" fill="white"/>
        <circle cx="27" cy="25" r="3" fill="#EB001B" opacity=".8"/>
        <circle cx="31" cy="25" r="3" fill="#F79E1B" opacity=".8"/>
      </svg>
    ),
  },
  {
    label: 'Indomaret',
    bg: '#CC0000',
    logo: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <rect x="8" y="22" width="24" height="12" rx="1.5" fill="white" opacity=".9"/>
        <path d="M8 22l4-8h16l4 8H8z" fill="white" opacity=".7"/>
        <rect x="16" y="26" width="8" height="8" rx="1" fill="#CC0000"/>
        <circle cx="13" cy="27" r="2" fill="#CC0000"/>
        <circle cx="27" cy="27" r="2" fill="#CC0000"/>
      </svg>
    ),
  },
  {
    label: 'Alfamart',
    bg: '#E31837',
    logo: (
      <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="800" fontFamily="Arial, sans-serif">alfa</text>
        <rect x="8" y="26" width="24" height="3" rx="1" fill="white" opacity=".5"/>
      </svg>
    ),
  },
]

function formatRp(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function Field({ label, name, value, onChange, required, placeholder, type = 'text' }: {
  label: string; name: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        className="w-full bg-gray-50 border border-black/[0.08] text-gray-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
      />
    </div>
  )
}

export default function Checkout() {
  const { isAuthenticated, user } = useAuth()
  const { items, total, fetch: fetchCart, clear } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    shipping_name:     user?.full_name ?? '',
    shipping_phone:    user?.phone ?? '',
    shipping_address:  '',
    shipping_city:     user?.city ?? '',
    shipping_province: '',
    shipping_postal:   '',
    notes:             '',
  })

  const [submitting, setSubmitting]       = useState(false)
  const [snapActive, setSnapActive]       = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [orderId, setOrderId]         = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [snapToken, setSnapToken]     = useState<string | null>(null)
  const [savedItems, setSavedItems]   = useState<CartItem[]>([])
  const [savedTotal, setSavedTotal]   = useState(0)
  const snapReady                     = useRef(false)

  const itemsWithoutPrice = items.filter(i => !i.product.price)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login?next=/checkout', { replace: true }); return }
    fetchCart()

    const existing = document.getElementById('midtrans-snap')
    if (existing) { snapReady.current = true; return }

    const script   = document.createElement('script')
    script.id      = 'midtrans-snap'
    script.src     = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? '')
    script.onload  = () => { snapReady.current = true }
    script.onerror = () => toast.error('Gagal memuat payment gateway. Coba refresh.')
    document.body.appendChild(script)
  }, [isAuthenticated])

  // Embed snap setelah token tersedia dan container ada di DOM
  useEffect(() => {
    if (!snapToken || !orderId) return
    if (!window.snap) { toast.error('Payment gateway belum siap. Coba refresh halaman.'); return }
    const id = orderId
    try {
      window.snap.embed(snapToken, {
        embedId:   'snap-container',
        onSuccess: () => navigate(`/orders/${id}?status=success`),
        onPending: () => navigate(`/orders/${id}?status=pending`),
        onError:   () => navigate(`/orders/${id}?status=error`),
        onClose:   () => navigate(`/orders/${id}`),
      })
    } catch {
      toast.error('Gagal memuat widget pembayaran. Coba refresh halaman.')
    }
  }, [snapToken, orderId, navigate])

  useEffect(() => {
    if (isAuthenticated && items.length === 0 && !snapActive && !submitting) {
      navigate('/cart', { replace: true })
    }
  }, [items, isAuthenticated, snapActive, submitting, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (itemsWithoutPrice.length > 0) {
      toast.error(`${itemsWithoutPrice.map(i => i.product.name).join(', ')} belum memiliki harga`)
      return
    }
    if (!snapReady.current) {
      toast.error('Payment gateway belum siap. Coba lagi sebentar.')
      return
    }

    setSubmitting(true)
    try {
      const orderRes  = await fetchWithAuth(API_URLS.orders.create, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const orderData = await orderRes.json()
      if (!orderData.success) { toast.error(orderData.message ?? 'Gagal membuat pesanan'); return }

      const { id, order_number } = orderData.data

      const payRes  = await fetchWithAuth(API_URLS.orders.initiatePayment, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ order_id: id }),
      })
      const payData = await payRes.json()
      if (!payData.success) { toast.error(payData.message ?? 'Gagal menginisiasi pembayaran'); return }

      setSavedItems(items)
      setSavedTotal(total)
      setSnapActive(true)   // guard redirect sebelum cart dikosongkan
      clear()

      setOrderId(id)
      setOrderNumber(order_number)
      setSnapToken(payData.data.snap_token)
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const displayItems = snapActive ? savedItems : items
  const displayTotal = snapActive ? savedTotal : total

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/"><Logo className="h-10 w-auto" variant="horizontal" /></Link>
          {!snapActive && (
            <Link to="/cart" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Kembali ke Keranjang
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black">Checkout</h1>
        </div>

        {itemsWithoutPrice.length > 0 && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Produk belum memiliki harga:</span>{' '}
              {itemsWithoutPrice.map(i => i.product.name).join(', ')}.
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column: shipping + payment stacked */}
          <div className="md:col-span-2 space-y-4">

            {/* Card 1: Alamat Pengiriman */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
              <h2 className="font-black text-base mb-5">Alamat Pengiriman</h2>
              <form id="shipping-form" onSubmit={handleSubmit} className={`space-y-4 ${snapActive ? 'pointer-events-none opacity-60' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nama Penerima" name="shipping_name"  value={form.shipping_name}  onChange={handleChange} required={!snapActive} placeholder="Nama lengkap" />
                  <Field label="Nomor Telepon" name="shipping_phone" value={form.shipping_phone} onChange={handleChange} required={!snapActive} placeholder="08xxxxxxxxxx" type="tel" />
                </div>
                <Field label="Alamat Lengkap" name="shipping_address" value={form.shipping_address} onChange={handleChange} required={!snapActive} placeholder="Jalan, No., RT/RW, Kelurahan, Kecamatan" />
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Kota"     name="shipping_city"     value={form.shipping_city}     onChange={handleChange} required={!snapActive} placeholder="Jakarta" />
                  <Field label="Provinsi" name="shipping_province" value={form.shipping_province} onChange={handleChange} required={!snapActive} placeholder="DKI Jakarta" />
                  <Field label="Kode Pos" name="shipping_postal"   value={form.shipping_postal}   onChange={handleChange} required={!snapActive} placeholder="12345" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Catatan (opsional)</label>
                  <textarea
                    name="notes" value={form.notes} onChange={handleChange} rows={2}
                    placeholder="Instruksi khusus pengiriman..."
                    className="w-full bg-gray-50 border border-black/[0.08] text-gray-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-gray-300"
                  />
                </div>
              </form>
            </div>

            {/* Card 2: Metode Pembayaran — selalu visible */}
            <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-black/[0.06]">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="font-black text-base">Metode Pembayaran</h2>
                {orderNumber && (
                  <span className="ml-auto text-xs text-gray-400 font-mono">{orderNumber}</span>
                )}
              </div>

              {!snapActive ? (
                <div className="p-6">
                  <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-wider">Metode Tersedia</p>
                  <div className="grid grid-cols-4 gap-3">
                    {PAYMENT_METHODS.map(m => {
                      const active = selectedMethod === m.label
                      return (
                        <div
                          key={m.label}
                          onClick={() => setSelectedMethod(m.label)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                            active
                              ? 'border-primary bg-primary/5'
                              : 'border-transparent bg-gray-50 hover:border-black/[0.10]'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: m.bg }}>
                            {m.logo}
                          </div>
                          <span className={`text-[10px] font-semibold text-center leading-tight ${active ? 'text-primary' : 'text-gray-500'}`}>{m.label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Ketersediaan metode ditentukan saat pembayaran diproses.</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div id="snap-container" className="min-h-[480px]" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: summary + CTA */}
          <div className="md:col-span-1">
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5 sticky top-6">
              <h2 className="font-black text-base mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" /> Ringkasan
              </h2>
              <div className="space-y-2 mb-4">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-500">
                    <span className="truncate flex-1 mr-2">{item.product.name} ×{item.quantity}</span>
                    <span className="font-semibold shrink-0">
                      {item.product.price
                        ? formatRp(item.product.price * item.quantity)
                        : <span className="text-amber-500 text-xs">—</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-black/[0.06] pt-3 mb-5 flex justify-between">
                <span className="font-black">Total</span>
                <span className="font-black text-primary text-lg">{formatRp(displayTotal)}</span>
              </div>

              {!snapActive && (
                <motion.button
                  type="submit"
                  form="shipping-form"
                  disabled={submitting || itemsWithoutPrice.length > 0}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Lanjut ke Pembayaran <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
