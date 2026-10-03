import { useState, useEffect, useRef } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Heart, ShoppingBag, Truck, Shield, RefreshCw, ChevronDown,
  ChevronUp, ZoomIn, Share2, Check, Star, Minus, Plus
} from 'lucide-react'
import { productService } from '@/services/productService'
import { reviewService } from '@/services/reviewService'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice, formatDate, truncate } from '@/utils/formatters'
import Rating from '@/components/common/Rating'
import ProductCard from '@/components/product/ProductCard'
import Breadcrumb from '@/components/common/Breadcrumb'
import { Skeleton } from '@/components/common/Skeleton'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState({ results: [], stats: {} })
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [adding, setAdding] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const { addToCart } = useCart()
  const { toggle, isInWishlist } = useWishlist()

  useEffect(() => {
    setLoading(true)
    setActiveImage(0)
    setSelectedVariant(null)
    setQuantity(1)
    Promise.all([
      productService.getProduct(slug),
      reviewService.getReviews(slug, { page: 1 }),
    ]).then(([p, r]) => {
      setProduct(p)
      setReviews(r)
    }).catch((err) => {
      console.error('Product fetch error:', err?.response?.status, err?.message)
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <ProductDetailSkeleton />
  if (!product) return (
    <div className="container-aura py-20 text-center">
      <p className="text-charcoal-400">Product not found.</p>
      <Link to="/shop" className="btn-primary mt-4 inline-flex">Browse Products</Link>
    </div>
  )

  const images = product.images || []
  const currentImage = images[activeImage]
  const inWishlist = isInWishlist(product.id)
  const effectivePrice = parseFloat(product.effective_price || product.price)
  const variants = product.variants || []
  const groupedVariants = variants.reduce((acc, v) => {
    if (!acc[v.variant_type]) acc[v.variant_type] = []
    acc[v.variant_type].push(v)
    return acc
  }, {})

  const handleAddToCart = async () => {
    setAdding(true)
    await addToCart(product.id, selectedVariant?.id, quantity)
    setAdding(false)
  }

  const handleBuyNow = async () => {
    setAdding(true)
    await addToCart(product.id, selectedVariant?.id, quantity)
    setAdding(false)
  }

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'benefits', label: 'Benefits' },
    { key: 'how_to_use', label: 'How to Use' },
  ].filter(t => product[t.key])

  return (
    <div className="min-h-screen bg-ivory-100 animate-fade-in">
      <div className="container-aura py-6">
        <Breadcrumb items={[
          { to: '/', label: 'Home' },
          { to: '/shop', label: 'Shop' },
          { to: `/shop?category=${product.category?.slug}`, label: product.category?.name || 'Products' },
          { label: truncate(product.name, 40) },
        ]} />
      </div>

      <div className="container-aura pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Images ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="relative bg-white rounded-3xl overflow-hidden aspect-square cursor-zoom-in shadow-soft"
              onClick={() => setZoomed(!zoomed)}
            >
              {currentImage ? (
                <img
                  src={currentImage.image}
                  alt={currentImage.alt_text || product.name}
                  className={clsx(
                    'w-full h-full object-cover transition-transform duration-300',
                    zoomed ? 'scale-150' : 'scale-100'
                  )}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nude-50 to-champagne-100">
                  <span className="font-display text-8xl text-nude-200 font-light">A</span>
                </div>
              )}
              <button className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-soft hover:bg-white transition-colors">
                <ZoomIn size={16} className="text-charcoal-500" />
              </button>
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.is_new_arrival && <span className="badge bg-charcoal text-white text-2xs">NEW</span>}
                {product.is_best_seller && <span className="badge bg-nude text-white text-2xs">BESTSELLER</span>}
                {product.discount_percent > 0 && (
                  <span className="badge bg-green-500 text-white text-2xs">-{product.discount_percent}%</span>
                )}
              </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={clsx(
                      'w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all',
                      activeImage === i ? 'border-nude' : 'border-transparent hover:border-nude-200'
                    )}
                  >
                    <img src={img.image} alt={img.alt_text} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ────────────────────────────────────────────── */}
          <div>
            {product.brand && (
              <Link
                to={`/shop?brand=${product.brand.slug}`}
                className="text-xs font-semibold tracking-widest text-nude uppercase hover:text-nude-700 transition-colors"
              >
                {product.brand.name}
              </Link>
            )}
            <h1 className="font-display text-3xl md:text-4xl text-charcoal mt-2 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-4">
              <Rating
                rating={parseFloat(product.rating)}
                reviewCount={product.review_count}
                size={16}
              />
              {product.review_count > 0 && (
                <a href="#reviews" className="text-xs text-nude hover:underline">
                  {product.review_count} reviews
                </a>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-6">
              <span className="font-serif text-3xl font-semibold text-charcoal">
                {formatPrice(effectivePrice)}
              </span>
              {parseFloat(product.mrp) > effectivePrice && (
                <span className="text-lg text-charcoal-300 line-through">{formatPrice(product.mrp)}</span>
              )}
              {product.discount_percent > 0 && (
                <span className="badge bg-green-100 text-green-700 text-sm">
                  {product.discount_percent}% OFF
                </span>
              )}
            </div>
            {product.savings > 0 && (
              <p className="text-xs text-green-600 mt-1">You save {formatPrice(product.savings)}</p>
            )}
            {product.is_taxable && (
              <p className="text-2xs text-charcoal-400 mt-0.5">Inclusive of all taxes</p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2 mt-4">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                product.is_in_stock ? (product.is_low_stock ? 'bg-amber-400' : 'bg-green-400') : 'bg-red-400'
              )} />
              <span className={clsx(
                'text-xs font-medium',
                product.is_in_stock ? (product.is_low_stock ? 'text-amber-600' : 'text-green-600') : 'text-red-500'
              )}>
                {product.is_in_stock
                  ? product.is_low_stock
                    ? `Only ${product.stock_quantity} left — Order soon!`
                    : 'In Stock'
                  : 'Out of Stock'}
              </span>
            </div>

            {product.short_description && (
              <p className="text-sm text-charcoal-500 mt-5 leading-relaxed border-t border-nude-100 pt-5">
                {product.short_description}
              </p>
            )}

            {/* Variants */}
            {Object.entries(groupedVariants).map(([type, vars]) => (
              <div key={type} className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-400 mb-2">
                  {type}
                  {selectedVariant && selectedVariant.variant_type === type && (
                    <span className="text-nude ml-2 normal-case font-normal">{selectedVariant.name}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {vars.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        selectedVariant?.id === v.id
                          ? 'border-nude bg-nude text-white'
                          : 'border-nude-200 text-charcoal-500 hover:border-nude'
                      )}
                      style={v.value?.startsWith('#') ? {
                        background: selectedVariant?.id === v.id ? v.value : 'white',
                        borderColor: v.value,
                      } : {}}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-400 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-nude-200 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 hover:bg-nude-50 transition-colors"
                  >
                    <Minus size={14} className="text-charcoal-500" />
                  </button>
                  <span className="px-4 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="px-4 py-2.5 hover:bg-nude-50 transition-colors disabled:opacity-40"
                  >
                    <Plus size={14} className="text-charcoal-500" />
                  </button>
                </div>
                {product.weight && (
                  <span className="text-xs text-charcoal-400">{product.weight}</span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || adding}
                className="btn-secondary flex-1 py-4 gap-2"
              >
                {adding ? (
                  <span className="w-4 h-4 border-2 border-nude/30 border-t-nude rounded-full animate-spin" />
                ) : (
                  <ShoppingBag size={18} />
                )}
                Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.is_in_stock}
                className="btn-primary flex-1 py-4"
              >
                Buy Now
              </button>
              <button
                onClick={() => toggle(product.id)}
                className={clsx(
                  'w-14 h-14 rounded-full border transition-all duration-200 flex items-center justify-center',
                  inWishlist ? 'bg-nude border-nude text-white' : 'border-nude-200 text-charcoal-500 hover:border-nude'
                )}
                aria-label="Wishlist"
              >
                <Heart size={18} className={inWishlist ? 'fill-white' : ''} />
              </button>
            </div>

            {/* Delivery & Returns */}
            <div className="mt-7 grid grid-cols-3 gap-3 p-4 bg-ivory rounded-2xl">
              {[
                { icon: Truck, text: 'Free delivery above ₹999' },
                { icon: Shield, text: '100% Authentic' },
                { icon: RefreshCw, text: '15-day returns' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5">
                  <Icon size={18} className="text-nude" />
                  <span className="text-2xs text-charcoal-400 leading-tight">{text}</span>
                </div>
              ))}
            </div>

            {/* Product details pills */}
            {(product.weight || product.shelf_life || product.sku) && (
              <div className="flex flex-wrap gap-2 mt-5">
                {product.sku && (
                  <span className="text-2xs bg-ivory px-3 py-1 rounded-full text-charcoal-400">SKU: {product.sku}</span>
                )}
                {product.weight && (
                  <span className="text-2xs bg-ivory px-3 py-1 rounded-full text-charcoal-400">Weight: {product.weight}</span>
                )}
                {product.shelf_life && (
                  <span className="text-2xs bg-ivory px-3 py-1 rounded-full text-charcoal-400">Shelf Life: {product.shelf_life}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Product Details Tabs ───────────────────────────────────── */}
        {tabs.length > 0 && (
          <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-soft">
            <div className="flex gap-1 border-b border-nude-100 mb-6 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    'px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                    activeTab === tab.key
                      ? 'border-nude text-nude'
                      : 'border-transparent text-charcoal-400 hover:text-charcoal'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="prose prose-sm max-w-none text-charcoal-500 leading-relaxed">
              {product[activeTab]?.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews ───────────────────────────────────────────────── */}
        <div id="reviews" className="mt-10">
          <ReviewsSection
            product={product}
            reviews={reviews}
          />
        </div>

        {/* ── Related Products ──────────────────────────────────────── */}
        {product.related_products?.length > 0 && (
          <div className="mt-12">
            <div className="flex items-end justify-between mb-7">
              <h2 className="font-display text-2xl text-charcoal">You May Also Like</h2>
              <Link to={`/shop?category=${product.category?.slug}`} className="text-sm text-nude hover:text-nude-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {product.related_products.slice(0, 6).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-nude-100 p-4 flex gap-3">
        <button
          onClick={() => toggle(product.id)}
          className={clsx(
            'w-12 h-12 rounded-full border flex items-center justify-center transition-all',
            inWishlist ? 'bg-nude border-nude' : 'border-nude-200'
          )}
        >
          <Heart size={18} className={inWishlist ? 'text-white fill-white' : 'text-charcoal-500'} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={!product.is_in_stock || adding}
          className="flex-1 btn-secondary py-3"
        >
          <ShoppingBag size={16} /> Add to Bag
        </button>
        <button onClick={handleBuyNow} disabled={!product.is_in_stock} className="flex-1 btn-primary py-3">
          Buy Now
        </button>
      </div>
      <div className="h-24 md:hidden" />
    </div>
  )
}

// ─── Reviews Section ──────────────────────────────────────────────────────────

function ReviewsSection({ product, reviews }) {
  const stats = reviews.stats || {}
  const items = reviews.results || []

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft">
      <div className="flex items-end justify-between mb-7">
        <h2 className="font-display text-2xl text-charcoal">Customer Reviews</h2>
      </div>

      {stats.total_reviews > 0 ? (
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-nude-100">
          {/* Overall score */}
          <div className="flex flex-col items-center justify-center min-w-[140px]">
            <span className="font-display text-6xl font-semibold text-charcoal">
              {stats.average_rating}
            </span>
            <Rating rating={parseFloat(stats.average_rating)} showCount={false} size={20} className="mt-2" />
            <span className="text-xs text-charcoal-400 mt-1">{stats.total_reviews} reviews</span>
          </div>
          {/* Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.distribution?.[star] || 0
              const pct = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs text-charcoal-400 w-8">{star}★</span>
                  <div className="flex-1 bg-nude-100 rounded-full h-2">
                    <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-charcoal-400 w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-6">
          {items.map(review => (
            <div key={review.id} className="pb-6 border-b border-nude-50 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-nude/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-nude">
                      {review.user?.first_name?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{review.user?.first_name || 'Customer'}</p>
                    {review.is_verified_purchase && (
                      <span className="text-2xs text-green-600 flex items-center gap-1">
                        <Check size={10} /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-charcoal-400">{formatDate(review.created_at)}</span>
              </div>
              <Rating rating={review.rating} showCount={false} size={14} className="mb-2" />
              {review.title && <p className="text-sm font-medium text-charcoal mb-1">{review.title}</p>}
              <p className="text-sm text-charcoal-500 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Star size={32} className="text-nude-200 mx-auto mb-3" />
          <p className="text-sm text-charcoal-400">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="container-aura py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40 mt-4" />
          <Skeleton className="h-20 w-full mt-4" />
          <Skeleton className="h-12 w-full mt-6" />
        </div>
      </div>
    </div>
  )
}
