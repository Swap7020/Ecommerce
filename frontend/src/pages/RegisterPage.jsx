import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { registerUser } from '@/store/slices/authSlice'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  useEffect(() => {
    if (isAuthenticated) navigate('/account', { replace: true })
  }, [isAuthenticated])

  const onSubmit = async (data) => {
    setApiError('')
    const result = await dispatch(registerUser(data))
    if (registerUser.rejected.match(result)) {
      const err = result.payload
      setApiError(err?.email?.[0] || err?.password?.[0] || err?.error || 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-4xl font-semibold tracking-[0.2em] text-charcoal">
            AURA
          </Link>
          <h1 className="font-display text-2xl text-charcoal mt-4">Create Your Account</h1>
          <p className="text-sm text-charcoal-400 mt-1">Join AURA and discover premium beauty</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-soft">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                  <input
                    {...register('first_name', { required: 'Required' })}
                    className={clsx('input pl-9', errors.first_name && 'input-error')}
                    placeholder="Priya"
                  />
                </div>
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  {...register('last_name')}
                  className="input"
                  placeholder="Sharma"
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  })}
                  type="email"
                  className={clsx('input pl-9', errors.email && 'input-error')}
                  placeholder="you@email.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={clsx('input pl-9 pr-10', errors.password && 'input-error')}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input
                  {...register('password2', {
                    required: 'Please confirm your password',
                    validate: v => v === password || 'Passwords do not match'
                  })}
                  type="password"
                  className={clsx('input pl-9', errors.password2 && 'input-error')}
                  placeholder="Repeat password"
                />
              </div>
              {errors.password2 && <p className="text-xs text-red-500 mt-1">{errors.password2.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-base mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-nude-100 text-center">
            <p className="text-sm text-charcoal-400">
              Already have an account?{' '}
              <Link to="/login" className="text-nude font-medium hover:text-nude-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
