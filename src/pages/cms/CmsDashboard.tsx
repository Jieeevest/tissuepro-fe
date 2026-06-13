import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Package, BookOpen, TrendingUp, ArrowRight, Clock, ShoppingBag, DollarSign, AlertCircle, ChevronRight } from 'lucide-react'
import { CmsLayout } from '@/components/cms/CmsLayout'
import { useSessionGuard } from '@/hooks/useSessionGuard'
import { fetchWithAuth } from '@/lib/api'
import { cn } from '@/lib/utils'

const INQUIRY_STATUS_COLOR: Record<string, string> = {
  baru:     'bg-blue-500/10 text-blue-500 border-blue-500/20',
  diproses: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  selesai:  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
}

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:          'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  awaiting_payment: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  paid:             'bg-green-500/10 text-green-600 border-green-500/20',
  processing:       'bg-blue-500/10 text-blue-600 border-blue-500/20',
  shipped:          'bg-purple-500/10 text-purple-600 border-purple-500/20',
  delivered:        'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled:        'bg-red-500/10 text-red-500 border-red-500/20',
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending:          'Menunggu',
  awaiting_payment: 'Menunggu',
  paid:             'Dibayar',
  processing:       'Diproses',
  shipped:          'Dikirim',
  delivered:        'Selesai',
  cancelled:        'Dibatalkan',
}

const SHORTCUTS = [
  { label: 'Kelola Pesanan',      path: '/cms/orders',    icon: ShoppingBag },
  { label: 'Lihat Semua Inquiry', path: '/cms/inquiries', icon: MessageSquare },
  { label: 'Kelola Produk',       path: '/cms/products',  icon: Package },
  { label: 'Tambah Artikel Baru', path: '/cms/articles',  icon: BookOpen },
]

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function formatRpFull(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

interface DashboardStats {
  total_inquiries:   number
  new_inquiries:     number
  active_products:   number
  published_articles: number
  revenue_today:     number
  revenue_week:      number
  revenue_month:     number
  revenue_total:     number
  orders_today:      number
  pending_orders:    number
  recent_inquiries:  Array<{
    id: string; name: string; clinic: string
    product_interest: string; status: string; created_at: string
  }>
  recent_orders: Array<{
    id: string; order_number: string; status: string
    total_amount: number; created_at: string
    user: { full_name: string | null; email: string }
    items: { product_name: string; quantity: number }[]
  }>
}

export default function CmsDashboard() {
  useSessionGuard()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchWithAuth('/api/cms/dashboard/stats')
        const data = await res.json()
        if (data.success) setStats(data.data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const REVENUE_CARDS = [
    { label: 'Revenue Hari Ini',   value: stats?.revenue_today  ?? 0, icon: DollarSign,  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Revenue Minggu Ini', value: stats?.revenue_week   ?? 0, icon: TrendingUp,  color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
    { label: 'Revenue Bulan Ini',  value: stats?.revenue_month  ?? 0, icon: TrendingUp,  color: 'text-primary',     bg: 'bg-primary/10'     },
    { label: 'Total Revenue',      value: stats?.revenue_total  ?? 0, icon: DollarSign,  color: 'text-purple-500',  bg: 'bg-purple-500/10'  },
  ]

  const STAT_CARDS = [
    { label: 'Pesanan Hari Ini',  value: stats?.orders_today    ?? 0, icon: ShoppingBag,   color: 'text-amber-500',   bg: 'bg-amber-500/10',   link: '/cms/orders'    },
    { label: 'Perlu Diproses',    value: stats?.pending_orders  ?? 0, icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-500/10',     link: '/cms/orders'    },
    { label: 'Inquiry Baru',      value: stats?.new_inquiries   ?? 0, icon: MessageSquare, color: 'text-blue-500',    bg: 'bg-blue-500/10',    link: '/cms/inquiries' },
    { label: 'Produk Aktif',      value: stats?.active_products ?? 0, icon: Package,       color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/cms/products'  },
  ]

  return (
    <CmsLayout title="Dashboard" subtitle="Ringkasan aktivitas toko">
      <div className="space-y-6">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Revenue cards */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Revenue</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {REVENUE_CARDS.map(s => (
                  <div key={s.label} className="p-5 bg-card border border-border rounded-2xl">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div className={`text-2xl font-black mb-0.5 ${s.color}`}>{formatRp(s.value)}</div>
                    <div className="text-xs text-muted-foreground font-semibold">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground/60 mt-0.5">{formatRpFull(s.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Ringkasan</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map(s => (
                  <Link
                    key={s.label}
                    to={s.link}
                    className="p-5 bg-card border border-border rounded-2xl hover:border-border/80 hover:shadow-sm transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div className="text-3xl font-black text-foreground mb-0.5">{s.value}</div>
                    <div className="text-xs text-muted-foreground font-semibold">{s.label}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent orders + inquiries */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Recent orders */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                  <div className="font-black text-sm text-foreground">Pesanan Terbaru</div>
                  <Link to="/cms/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Lihat semua <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {(stats?.recent_orders ?? []).length > 0
                    ? (stats?.recent_orders ?? []).map(order => (
                        <Link
                          key={order.id}
                          to={`/cms/orders/${order.id}`}
                          className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-black text-muted-foreground">{order.order_number}</span>
                              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-black uppercase border', ORDER_STATUS_COLOR[order.status] ?? '')}>
                                {ORDER_STATUS_LABEL[order.status] ?? order.status}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-foreground">{order.user.full_name ?? order.user.email}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {order.items.map(i => `${i.product_name} ×${i.quantity}`).join(', ')}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="font-black text-sm text-foreground">{formatRp(Number(order.total_amount))}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        </Link>
                      ))
                    : (
                      <div className="px-6 py-12 text-center text-muted-foreground text-sm">Belum ada pesanan.</div>
                    )}
                </div>
              </div>

              {/* Right column: recent inquiries + shortcuts */}
              <div className="flex flex-col gap-4">

                {/* Recent inquiries */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden flex-1">
                  <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                    <div className="font-black text-sm text-foreground">Inquiry Terbaru</div>
                    <Link to="/cms/inquiries" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Semua <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="divide-y divide-border">
                    {(stats?.recent_inquiries ?? []).length > 0
                      ? (stats?.recent_inquiries ?? []).map(r => (
                          <div key={r.id} className="px-5 py-3 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-foreground truncate">{r.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{r.product_interest}</div>
                              </div>
                              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-black uppercase border shrink-0', INQUIRY_STATUS_COLOR[r.status] ?? '')}>
                                {r.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      : (
                        <div className="px-5 py-8 text-center text-muted-foreground text-sm">Belum ada inquiry.</div>
                      )}
                  </div>
                </div>

                {/* Shortcuts */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="font-black text-sm text-foreground mb-3">Akses Cepat</div>
                  <div className="space-y-1">
                    {SHORTCUTS.map(s => (
                      <Link
                        key={s.path}
                        to={s.path}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all border border-transparent hover:border-border"
                      >
                        <s.icon className="w-4 h-4" />
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </CmsLayout>
  )
}
