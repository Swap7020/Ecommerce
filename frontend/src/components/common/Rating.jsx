import { Star } from 'lucide-react'
import clsx from 'clsx'

export default function Rating({ rating = 0, reviewCount, size = 14, showCount = true, className = '' }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full'
    if (i < rating) return 'half'
    return 'empty'
  })

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((type, i) => (
          <Star
            key={i}
            size={size}
            className={clsx(
              type === 'full' ? 'text-amber-400 fill-amber-400' :
              type === 'half' ? 'text-amber-400 fill-amber-200' :
              'text-gray-200 fill-gray-200'
            )}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-charcoal-400">({reviewCount})</span>
      )}
    </div>
  )
}
