import { useState } from 'react'
import { X } from 'lucide-react'

const messages = [
  '✨ Free shipping on orders above ₹999',
  '🌿 100% Authentic Products — Certified Quality',
  '💄 New Arrivals Every Week — Shop Now',
]

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  const [idx, setIdx] = useState(0)

  if (!visible) return null

  return (
    <div className="announcement-bar relative">
      <button
        onClick={() => setIdx((i) => (i + 1) % messages.length)}
        className="w-full text-center text-xs py-0.5 tracking-widest"
        aria-label="Next announcement"
      >
        {messages[idx]}
      </button>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="Close announcement"
      >
        <X size={14} />
      </button>
    </div>
  )
}
