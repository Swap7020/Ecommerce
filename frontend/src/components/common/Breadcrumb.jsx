import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-charcoal-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} />}
          {item.to && i < items.length - 1 ? (
            <Link to={item.to} className="hover:text-nude transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-charcoal font-medium' : ''}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
