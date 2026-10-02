import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '@/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-charcoal mb-3">Check Your Email</h2>
              <p className="text-sm text-charcoal-400 mb-6">
                We've sent password reset instructions to <strong>{email}</strong>.
                The link expires in 2 hours.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-charcoal mb-2">Forgot Password?</h1>
              <p className="text-sm text-charcoal-400 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="input pl-10"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-6 pt-5 border-t border-nude-100">
                <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-charcoal-400 hover:text-nude">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
