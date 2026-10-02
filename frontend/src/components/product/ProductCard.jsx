import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { formatPrice } from '@/utils/formatters'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import Rating from '@/components/common/Rating'
import clsx from 'clsx'

export default function ProductCard({ product, className = '' }) {
  const { addToCart } = useCart()
  const { toggle, isInWishlist } = useWishlist()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [adding, setAdding] = useState(false)

  const inWishlist = isInWishlist(product.id)
  const img = product.primary_image

  const handleAddToCart = async (e) => {
    e.preventDefault()
    setAdding(true)
    await addToCart(product.id, null, 1)
    setAdding(false)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    toggle(product.id)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className={clsx('group block', className)}
      aria-label={`View ${product.name}`}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-product transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-product bg-nude-50 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          {img ? (
            <img
              src={img.url}
              alt={img.alt || product.name}
              className={clsx(
                'w-full h-full object-cover transition-all duration-500 group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-nude-100">
              <span className="font-display text-4xl text-nude-300">A</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new_arrival && (
              <span className="badge bg-charcoal text-white text-2xs">NEW</span>
            )}
            {product.is_best_seller && (
              <span className="badge bg-nude text-white text-2xs">BESTSELLER</span>
            )}
            {product.discount_percent > 0 && (
              <span className="badge bg-green-500 text-white text-2xs">
                -{product.discount_percent}%
              </span>
            )}
            {!product.is_in_stock && (
              <span className="badge bg-red-500 text-white text-2xs">OUT OF STOCK</span>
            )}
          </div>

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={handleWishlist}
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200',
                inWishlist
                  ? 'bg-nude text-white'
                  : 'bg-white text-charcoal-500 hover:bg-nude hover:text-white'
              )}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={15} className={inWishlist ? 'fill-white' : ''} />
            </button>
            <Link
              to={`/products/${product.slug}`}
              onClick={e => e.stopPropagation()}
              className="w-9 h-9 rounded-full bg-white text-charcoal-500 flex items-center justify-center shadow-md hover:bg-nude hover:text-white transition-all duration-200"
              aria-label="Quick view"
            >
              <Eye size={15} />
            </Link>
          </div>

          {/* Add to cart - appears on hover at bottom */}
          {product.is_in_stock && (
            <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full py-3 bg-charcoal text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-nude transition-colors duration-200"
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    Add to Bag
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand_name && (
            <p className="text-2xs font-semibold tracking-widest text-nude uppercase mb-1">
              {product.brand_name}
            </p>
          )}
          <h3 className="text-sm font-medium text-charcoal line-clamp-2 leading-snug mb-2 group-hover:text-nude transition-colors">
            {product.name}
          </h3>
          <Rating rating={parseFloat(product.rating)} reviewCount={product.review_count} size={12} />
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-semibold text-charcoal">
              {formatPrice(product.effective_price || product.price)}
            </span>
            {product.mrp && parseFloat(product.mrp) > parseFloat(product.effective_price || product.price) && (
              <span className="text-xs text-charcoal-300 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
            {product.discount_percent > 0 && (
              <span className="text-xs text-green-600 font-medium">{product.discount_percent}% off</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
