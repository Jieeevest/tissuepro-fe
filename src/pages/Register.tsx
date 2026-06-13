import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Phone, Building2, MapPin, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { API_URLS } from '@/constants/apiUrls'
import { Logo } from '@/components/Logo'

export default function Register() {
  const navigate = useNavigate()
  const login = useAuth((s) => s.login)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    institution: '',
    city: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(API_URLS.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          institution: form.institution || undefined,
          city: form.city || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || 'Registrasi gagal')
        return
      }
      login(data.data.accessToken, data.data.refreshToken, data.data.user)
      navigate('/', { replace: true })
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <Logo className="h-12 w-auto mx-auto mb-4" variant="horizontal" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Buat Akun</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar untuk mulai berbelanja produk TissuePro</p>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-3xl p-8 shadow-sm">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 mb-5 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <RegisterField icon={User} label="Nama Lengkap" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Dr. Nama Lengkap" />

            <RegisterField icon={Mail} label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@institusi.ac.id" />

            <div className="grid grid-cols-2 gap-3">
              <RegisterField icon={Lock} label="Password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 8 karakter" />
              <RegisterField icon={Lock} label="Konfirmasi Password" name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} required placeholder="Ulangi password" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <RegisterField icon={Phone} label="Nomor WhatsApp" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" />
              <RegisterField icon={MapPin} label="Kota" name="city" value={form.city} onChange={handleChange} placeholder="Jakarta" />
            </div>

            <RegisterField icon={Building2} label="Nama Institusi" name="institution" value={form.institution} onChange={handleChange} placeholder="Universitas / Rumah Sakit / Lembaga" />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Daftar Sekarang <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
          <CheckCircle className="w-3 h-3" />
          Data Anda aman dan tidak akan dibagikan
        </div>
      </motion.div>
    </div>
  )
}

function RegisterField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  type = 'text',
}: {
  icon: React.ElementType
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full bg-gray-50 border border-black/[0.08] text-gray-900 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
        />
      </div>
    </div>
  )
}
