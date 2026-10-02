import ProductCard from './ProductCard'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import { Search } from 'lucide-react'

export default function ProductGrid({ products = [], isLoading = false, emptyTitle, emptyDesc }) {
  if (isLoading) return <ProductGridSkeleton />

  if (!products.length) {
    return (
      <EmptyState
        icon={Search}
        title={emptyTitle || 'No products found'}
        description={emptyDesc || 'Try adjusting your filters or search term.'}
        actionLabel="Browse All Products"
        actionTo="/shop"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
