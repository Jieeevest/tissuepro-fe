import { useEffect, useState } from 'react'
import { CmsLayout } from '@/components/cms/CmsLayout'
import { useSessionGuard } from '@/hooks/useSessionGuard'
import { fetchWithAuth } from '@/lib/api'
import { API_URLS } from '@/constants/apiUrls'
import { cn } from '@/lib/utils'
import { ChevronRight, Package } from 'lucide-react'
import { Select } from '@/components/Select'
import { Link } from 'react-router-dom'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'awaiting_payment', label: 'Menunggu Pembayaran (Snap)' },
  { value: 'paid', label: 'Sudah Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const STATUS_COLOR: Record<string, string> = {
  pending:          'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  awaiting_payment: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  paid:             'bg-green-500/10 text-green-600 border-green-500/20',
  processing:       'bg-blue-500/10 text-blue-600 border-blue-500/20',
  shipped:          'bg-purple-500/10 text-purple-600 border-purple-500/20',
  delivered:        'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled:        'bg-red-500/10 text-red-500 border-red-500/20',
}

const UPDATABLE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Sudah Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

interface CmsOrder {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  user: { id: string; full_name: string | null; email: string; phone: string | null }
  items: { product_name: string; quantity: number }[]
  order_payment: { status: string; payment_method: string | null } | null
}

export default function CmsOrders() {
  useSessionGuard()

  const [orders, setOrders] = useState<CmsOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async (status = statusFilter) => {
    setLoading(true)
    try {
      const url = new URL(API_URLS.cms.orders)
      if (status) url.searchParams.set('status', status)
      const res = await fetchWithAuth(url.toString())
      const data = await res.json()
      if (data.success) { setOrders(data.data); setTotal(data.meta.total) }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      await fetchWithAuth(API_URLS.cms.orderStatus(orderId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
    } finally { setUpdatingId(null) }
  }

  return (
    <CmsLayout title="Pesanan" subtitle={`${total} total pesanan`}>
      <div className="space-y-5">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select
            compact
            placeholder="Filter Status"
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find((o) => o.value === statusFilter) ?? STATUS_OPTIONS[0]}
            onChange={(opt) => {
              const v = opt?.value ?? ''
              setStatusFilter(v)
              load(v)
            }}
            isSearchable={false}
            wrapperClassName="w-56"
          />
          <span className="text-sm text-muted-foreground">{total} pesanan</span>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
              <Package className="w-10 h-10 opacity-30" />
              Belum ada pesanan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground font-black uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-left">No. Pesanan</th>
                    <th className="px-5 py-3.5 text-left">Customer</th>
                    <th className="px-5 py-3.5 text-left">Produk</th>
                    <th className="px-5 py-3.5 text-right">Total</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-left">Update Status</th>
                    <th className="px-5 py-3.5 text-left">Tanggal</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-black text-xs text-muted-foreground">{order.order_number}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">{order.user.full_name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{order.user.email}</div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <div className="text-xs text-muted-foreground truncate">
                          {order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-black">{formatRp(Number(order.total_amount))}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('px-2 py-0.5 rounded-lg text-xs font-black uppercase border', STATUS_COLOR[order.status] ?? 'bg-muted text-muted-foreground border-border')}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs bg-background border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
                        >
                          {UPDATABLE_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/cms/orders/${order.id}`} className="text-primary hover:underline flex items-center gap-1 text-xs font-bold whitespace-nowrap">
                          Detail <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CmsLayout>
  )
}
