import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CmsLayout } from '@/components/cms/CmsLayout'
import { useSessionGuard } from '@/hooks/useSessionGuard'
import { fetchWithAuth } from '@/lib/api'
import { API_URLS } from '@/constants/apiUrls'
import { cn } from '@/lib/utils'
import { ArrowLeft, Package } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLOR: Record<string, string> = {
  pending:          'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  awaiting_payment: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  paid:             'bg-green-500/10 text-green-600 border-green-500/20',
  processing:       'bg-blue-500/10 text-blue-600 border-blue-500/20',
  shipped:          'bg-purple-500/10 text-purple-600 border-purple-500/20',
  delivered:        'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled:        'bg-red-500/10 text-red-500 border-red-500/20',
}

const STATUS_LABEL: Record<string, string> = {
  pending:          'Menunggu',
  awaiting_payment: 'Menunggu Pembayaran',
  paid:             'Sudah Dibayar',
  processing:       'Diproses',
  shipped:          'Dikirim',
  delivered:        'Selesai',
  cancelled:        'Dibatalkan',
}

const UPDATABLE_STATUSES = [
  { value: 'pending',    label: 'Pending' },
  { value: 'paid',       label: 'Sudah Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped',    label: 'Dikirim' },
  { value: 'delivered',  label: 'Selesai' },
  { value: 'cancelled',  label: 'Dibatalkan' },
]

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending:  'Menunggu',
  paid:     'Lunas',
  failed:   'Gagal',
  expired:  'Kedaluwarsa',
  refunded: 'Dikembalikan',
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

interface OrderDetailData {
  id: string
  order_number: string
  status: string
  total_amount: number
  notes: string | null
  created_at: string
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_province: string
  shipping_postal: string
  user: { id: string; full_name: string | null; email: string; phone: string | null; institution: string | null; city: string | null }
  items: { id: string; product_name: string; price: number; quantity: number }[]
  order_payment: {
    status: string
    payment_method: string | null
    midtrans_order_id: string
    amount: number
    paid_at: string | null
  } | null
}

export default function CmsOrderDetail() {
  useSessionGuard()

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchWithAuth(API_URLS.cms.order(id))
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrder(d.data) })
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return
    setUpdatingStatus(true)
    try {
      const res = await fetchWithAuth(API_URLS.cms.orderStatus(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
        toast.success('Status pesanan diperbarui')
      }
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <CmsLayout
      title="Detail Pesanan"
      subtitle={order?.order_number ?? ''}
      action={
        <button
          onClick={() => navigate('/cms/orders')}
          className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm font-bold hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      }
    >
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !order ? (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Package className="w-10 h-10 opacity-30" />
          Pesanan tidak ditemukan.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: items + payment */}
          <div className="lg:col-span-2 space-y-5">
            {/* Items */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground">Item Pesanan</h3>
                <span className="text-xs text-muted-foreground">{order.items.length} produk</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground font-black uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Produk</th>
                    <th className="px-5 py-3 text-right">Harga</th>
                    <th className="px-5 py-3 text-center">Qty</th>
                    <th className="px-5 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3 font-bold">{item.product_name}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{formatRp(Number(item.price))}</td>
                      <td className="px-5 py-3 text-center">{item.quantity}</td>
                      <td className="px-5 py-3 text-right font-black">{formatRp(Number(item.price) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td colSpan={3} className="px-5 py-4 text-right font-black uppercase tracking-wider text-xs text-muted-foreground">Total</td>
                    <td className="px-5 py-4 text-right font-black text-primary text-base">{formatRp(Number(order.total_amount))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment info */}
            {order.order_payment && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-4">Informasi Pembayaran</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <DetailRow label="Status Pembayaran" value={
                    <span className={cn('px-2 py-0.5 rounded-lg text-xs font-black uppercase border', STATUS_COLOR[order.order_payment.status] ?? 'bg-muted text-muted-foreground border-border')}>
                      {PAYMENT_STATUS_LABEL[order.order_payment.status] ?? order.order_payment.status}
                    </span>
                  } />
                  <DetailRow label="ID Transaksi Midtrans" value={order.order_payment.midtrans_order_id} />
                  <DetailRow label="Metode Pembayaran" value={order.order_payment.payment_method ?? '—'} />
                  <DetailRow label="Jumlah Dibayar" value={formatRp(Number(order.order_payment.amount))} />
                  {order.order_payment.paid_at && (
                    <DetailRow label="Waktu Pembayaran" value={new Date(order.order_payment.paid_at).toLocaleString('id-ID')} />
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-2">Catatan</h3>
                <p className="text-sm text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Right: status + customer + shipping */}
          <div className="space-y-5">
            {/* Status */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-4">Status Pesanan</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className={cn('px-3 py-1 rounded-lg text-xs font-black uppercase border', STATUS_COLOR[order.status] ?? 'bg-muted text-muted-foreground border-border')}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5 block">Update Status</label>
              <select
                value={order.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
              >
                {UPDATABLE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="mt-4 text-xs text-muted-foreground">
                Dibuat: {new Date(order.created_at).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Customer */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-4">Customer</h3>
              <div className="space-y-2.5">
                <DetailRow label="Nama" value={order.user.full_name ?? '—'} />
                <DetailRow label="Email" value={order.user.email} />
                <DetailRow label="Telepon" value={order.user.phone ?? '—'} />
                <DetailRow label="Institusi" value={order.user.institution ?? '—'} />
                <DetailRow label="Kota" value={order.user.city ?? '—'} />
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground mb-4">Alamat Pengiriman</h3>
              <div className="space-y-2.5">
                <DetailRow label="Nama" value={order.shipping_name} />
                <DetailRow label="Telepon" value={order.shipping_phone} />
                <DetailRow label="Alamat" value={order.shipping_address} />
                <DetailRow label="Kota" value={order.shipping_city} />
                <DetailRow label="Provinsi" value={order.shipping_province} />
                <DetailRow label="Kode Pos" value={order.shipping_postal} />
              </div>
            </div>
          </div>
        </div>
      )}
    </CmsLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  )
}
