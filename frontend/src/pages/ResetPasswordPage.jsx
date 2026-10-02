import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authService } from '@/services/authService'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ new_password: '', new_password2: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.new_password !== form.new_password2) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword({ token, ...form })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.token?.[0] || err.response?.data?.new_password?.[0] || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl font-semibold tracking-[0.2em] text-charcoal">AURA</Link>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-soft">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-charcoal mb-2">Password Reset!</h2>
              <p className="text-sm text-charcoal-400">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-charcoal mb-2">Set New Password</h1>
              <p className="text-sm text-charcoal-400 mb-6">Choose a strong password for your AURA account.</p>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.new_password}
                      onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                      required
                      minLength={8}
                      className="input pl-9 pr-10"
                      placeholder="Min 8 characters"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-300">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input
                      type="password"
                      value={form.new_password2}
                      onChange={e => setForm(f => ({ ...f, new_password2: e.target.value }))}
                      required
                      className="input pl-9"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
