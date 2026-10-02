import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-[120px] font-semibold leading-none text-nude-100">404</p>
        <h1 className="font-display text-3xl text-charcoal -mt-4 mb-3">Page Not Found</h1>
        <p className="text-sm text-charcoal-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary px-8">
            <ArrowLeft size={16} /> Go Home
          </Link>
          <Link to="/shop" className="btn-secondary px-8">Browse Products</Link>
        </div>
      </div>
    </div>
  )
}
