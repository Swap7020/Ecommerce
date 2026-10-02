import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginUser } from '@/store/slices/authSlice'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()
  const redirectTo = searchParams.get('next') || '/account'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated])

  const onSubmit = async (data) => {
    setApiError('')
    const result = await dispatch(loginUser(data))
    if (loginUser.rejected.match(result)) {
      const err = result.payload
      setApiError(err?.non_field_errors?.[0] || err?.error || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl font-semibold tracking-[0.2em] text-charcoal">
            AURA
          </Link>
          <h1 className="font-display text-2xl text-charcoal mt-4">Welcome Back</h1>
          <p className="text-sm text-charcoal-400 mt-1">Sign in to your AURA account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-soft">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  })}
                  type="email"
                  className={clsx('input pl-10', errors.email && 'input-error')}
                  placeholder="you@email.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-nude hover:text-nude-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className={clsx('input pl-10 pr-10', errors.password && 'input-error')}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-base"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-nude-100 text-center">
            <p className="text-sm text-charcoal-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-nude font-medium hover:text-nude-700 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-charcoal-400 mt-6">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-nude">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-nude">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
