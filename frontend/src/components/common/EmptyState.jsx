import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title = 'Nothing here yet',
  description = '',
  actionLabel = 'Shop Now',
  actionTo = '/shop',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 bg-nude-100/60 rounded-full flex items-center justify-center mb-5">
        <Icon size={32} className="text-nude" />
      </div>
      <h3 className="font-serif text-xl text-charcoal mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-charcoal-400 mb-6 max-w-xs">{description}</p>
      )}
      {actionLabel && (
        <Link to={actionTo} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
