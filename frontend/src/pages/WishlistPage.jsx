import { useEffect } from 'react'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { Heart, ShoppingBag, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/utils/formatters'
import EmptyState from '@/components/common/EmptyState'
import Breadcrumb from '@/components/common/Breadcrumb'
import Rating from '@/components/common/Rating'

export default function WishlistPage() {
  const { items, item_count, fetchWishlist, toggle, isLoading } = useWishlist()
  const { addToCart } = useCart()

  useEffect(() => { fetchWishlist() }, [])

  return (
    <div className="min-h-screen bg-ivory-100">
      <div className="container-aura py-6">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Wishlist' }]} />
        <div className="flex items-center justify-between mt-3 mb-8">
          <h1 className="font-display text-3xl text-charcoal">
            My Wishlist
            {item_count > 0 && (
              <span className="text-lg font-sans text-charcoal-400 ml-2">({item_count} items)</span>
            )}
          </h1>
          {items.length > 0 && (
            <Link to="/shop" className="btn-secondary py-2 px-4 text-xs">Continue Shopping</Link>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love and find them here later."
            actionLabel="Discover Products"
            actionTo="/shop"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {items.map(({ id, product }) => (
              <div key={id} className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-product transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-product bg-nude-50 overflow-hidden">
                  <Link to={`/products/${product.slug}`}>
                    {product.primary_image ? (
                      <img
                        src={product.primary_image.url}
                        alt={product.primary_image.alt || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-4xl text-nude-200">A</span>
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={() => toggle(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-soft hover:bg-red-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <X size={14} className="text-charcoal-400 hover:text-red-400" />
                  </button>
                  {product.discount_percent > 0 && (
                    <span className="absolute top-3 left-3 badge bg-green-500 text-white text-2xs">
                      -{product.discount_percent}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-2xs font-semibold tracking-widest text-nude uppercase mb-0.5">
                    {product.brand_name}
                  </p>
                  <Link
                    to={`/products/${product.slug}`}
                    className="text-sm font-medium text-charcoal hover:text-nude transition-colors line-clamp-2 leading-snug"
                  >
                    {product.name}
                  </Link>
                  <Rating rating={parseFloat(product.rating)} reviewCount={product.review_count} size={12} className="mt-1.5" />
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-semibold">{formatPrice(product.effective_price || product.price)}</span>
                    {parseFloat(product.mrp) > parseFloat(product.effective_price) && (
                      <span className="text-xs text-charcoal-300 line-through">{formatPrice(product.mrp)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product.id, null, 1)}
                    disabled={!product.is_in_stock}
                    className={`w-full mt-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      product.is_in_stock
                        ? 'bg-nude text-white hover:bg-nude-700'
                        : 'bg-gray-100 text-charcoal-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag size={13} />
                    {product.is_in_stock ? 'Add to Bag' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
