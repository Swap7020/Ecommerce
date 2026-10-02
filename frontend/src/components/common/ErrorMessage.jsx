import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <AlertCircle size={40} className="text-red-400 mb-4" />
      <p className="text-sm text-charcoal-400 mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  )
}
