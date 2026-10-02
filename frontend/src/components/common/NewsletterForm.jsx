import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function NewsletterForm({ dark = false }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await api.post('/notifications/newsletter/subscribe/', { email })
      setDone(true)
      toast.success('You\'re subscribed to AURA!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p className={clsx('text-sm font-medium', dark ? 'text-nude' : 'text-nude-700')}>
        ✓ You're subscribed! Expect beauty in your inbox.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto w-full">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className={clsx(
          'flex-1 px-4 py-3 rounded-full text-sm outline-none transition-all',
          dark
            ? 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-nude'
            : 'bg-white border border-nude-200 text-charcoal placeholder-charcoal-300 focus:border-nude'
        )}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary px-5 py-3 shrink-0"
        aria-label="Subscribe"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <ArrowRight size={16} />
        )}
      </button>
    </form>
  )
}
