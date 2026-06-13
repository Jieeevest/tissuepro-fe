import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '@/store/useAuth'
import { fetchWithAuth } from '@/lib/api'
import { API_URLS } from '@/constants/apiUrls'
import { Logo } from '@/components/Logo'

export default function ChangePassword() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isAuthenticated) {
    navigate('/login', { replace: true })
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      setError('Konfirmasi password baru tidak cocok')
      return
    }
    if (form.new_password.length < 8) {
      setError('Password baru minimal 8 karakter')
      return
    }
    if (form.new_password === form.old_password) {
      setError('Password baru tidak boleh sama dengan password lama')
      return
    }

    setLoading(true)
    try {
      const res = await fetchWithAuth(API_URLS.auth.password, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: form.old_password, new_password: form.new_password }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || 'Gagal mengubah password')
        return
      }
      setSuccess(true)
      setTimeout(() => { logout(); navigate('/login', { replace: true }) }, 2500)
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/"><Logo className="h-10 w-auto" variant="horizontal" /></Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Beranda</Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <KeyRound className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black">Ubah Password</h1>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-2xl p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-lg font-black mb-1">Password berhasil diubah</h2>
                <p className="text-sm text-gray-500">Anda akan diarahkan ke halaman login...</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 overflow-hidden"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <PasswordField
                  label="Password Lama"
                  name="old_password"
                  value={form.old_password}
                  onChange={handleChange}
                  placeholder="Masukkan password saat ini"
                />
                <PasswordField
                  label="Password Baru"
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  placeholder="Min. 8 karakter"
                />
                <PasswordField
                  label="Konfirmasi Password Baru"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Ulangi password baru"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Simpan Password Baru <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center pt-1">
                  Setelah password diubah, Anda akan diminta masuk kembali.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="password"
          name={name}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full bg-gray-50 border border-black/[0.08] text-gray-900 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
        />
      </div>
    </div>
  )
}
