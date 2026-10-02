import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, Star, ChevronRight } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import ProductCard from '@/components/product/ProductCard'
import { ProductGridSkeleton } from '@/components/common/Skeleton'
import Rating from '@/components/common/Rating'
import NewsletterForm from '@/components/common/NewsletterForm'

// ─── Static data ─────────────────────────────────────────────────────────────

const CONCERNS = [
  { label: 'Hydration', emoji: '💧', to: '/shop?concern=hydration' },
  { label: 'Brightening', emoji: '✨', to: '/shop?concern=brightening' },
  { label: 'Acne Care', emoji: '🌿', to: '/shop?concern=acne-care' },
  { label: 'Sensitive Skin', emoji: '🤍', to: '/shop?concern=sensitive-skin' },
  { label: 'Anti-Aging', emoji: '⏳', to: '/shop?concern=anti-aging' },
  { label: 'Daily Makeup', emoji: '💄', to: '/shop?is_featured=true' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The AURA Velvet Matte Lipstick is my absolute go-to. Stays on all day without drying out my lips. The shade range is gorgeous!',
    avatar: 'PS',
  },
  {
    name: 'Ananya Krishnan',
    location: 'Bangalore',
    rating: 5,
    text: 'Finally found a foundation that matches my Indian skin tone perfectly. The AURA Glow Foundation gives the most natural finish.',
    avatar: 'AK',
  },
  {
    name: 'Meera Patel',
    location: 'Delhi',
    rating: 5,
    text: 'I ordered the Hydrating Serum and it arrived beautifully packaged. My skin has never felt this smooth. Will definitely re-order!',
    avatar: 'MP',
  },
  {
    name: 'Riya Gupta',
    location: 'Pune',
    rating: 4,
    text: 'AURA has become my trusted beauty brand. Authentic products, quick delivery, and their customer support is so helpful!',
    avatar: 'RG',
  },
]

const WHY_AURA = [
  { icon: Shield, title: 'Authentic Products', desc: '100% genuine, dermatologist-tested formulas you can trust.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping above ₹999. Orders delivered in 2–5 days.' },
  { icon: RefreshCw, title: 'Easy Returns', desc: 'Hassle-free 15-day return policy. No questions asked.' },
  { icon: Headphones, title: 'Expert Support', desc: 'Beauty advisors available Mon–Sat, 9am to 8pm IST.' },
]

const SOCIAL_POSTS = [
  { id: 1, gradient: 'from-rose-100 to-nude-100' },
  { id: 2, gradient: 'from-champagne-100 to-ivory-200' },
  { id: 3, gradient: 'from-nude-100 to-rose-50' },
  { id: 4, gradient: 'from-ivory-200 to-champagne-100' },
  { id: 5, gradient: 'from-rose-50 to-nude-200' },
  { id: 6, gradient: 'from-champagne-200 to-nude-100' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [bs, na, cats] = await Promise.all([
          productService.getBestSellers(),
          productService.getNewArrivals(),
          categoryService.getCategories(),
        ])
        setBestSellers(bs.results || bs)
        setNewArrivals(na.results || na)
        setCategories(cats.results || cats)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="animate-fade-in">
      <HeroSection />
      <FeaturedCategories categories={categories} />
      <BestSellersSection products={bestSellers} loading={loading} />
      <PromoBanner />
      <NewArrivalsSection products={newArrivals} loading={loading} />
      <ShopByConcern />
      <WhyAuraSection />
      <TestimonialsSection />
      <SocialSection />
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-ivory">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-ivory-200 via-ivory to-champagne/30 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-5/12 hidden md:block">
        <div className="w-full h-full bg-gradient-to-l from-nude-100 to-transparent" />
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-nude/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-champagne/20 blur-2xl" />
      </div>

      <div className="container-aura relative z-10 py-20">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 mb-8 border border-nude-100 shadow-soft">
            <span className="w-2 h-2 bg-nude rounded-full animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-nude uppercase">
              New Collection Available
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-charcoal mb-6">
            Reveal Your
            <br />
            <span className="text-gradient font-semibold italic">Natural Aura.</span>
          </h1>

          <p className="text-base md:text-lg text-charcoal-400 leading-relaxed max-w-xl mb-10">
            Beauty essentials thoughtfully designed to help you look good, feel confident,
            and express your individuality. Discover AURA.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop" className="btn-primary px-8 py-4 text-base">
              Shop Collection
              <ArrowRight size={18} />
            </Link>
            <Link to="/shop?is_new_arrival=true" className="btn-secondary px-8 py-4 text-base">
              New Arrivals
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-6 mt-12 pt-8 border-t border-nude-100">
            <div className="text-center">
              <p className="font-serif text-2xl font-semibold text-charcoal">50K+</p>
              <p className="text-xs text-charcoal-400 mt-0.5">Happy Customers</p>
            </div>
            <div className="w-px h-10 bg-nude-100" />
            <div className="text-center">
              <p className="font-serif text-2xl font-semibold text-charcoal">200+</p>
              <p className="text-xs text-charcoal-400 mt-0.5">Products</p>
            </div>
            <div className="w-px h-10 bg-nude-100" />
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-charcoal">4.8/5</p>
                <p className="text-xs text-charcoal-400">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero image placeholder — replace with real image */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:flex items-center justify-center">
        <div className="relative w-80 h-[500px] rounded-[3rem] bg-gradient-to-br from-nude-100 to-champagne overflow-hidden shadow-product">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-nude/20 flex items-center justify-center">
              <span className="font-display text-4xl font-light text-nude">A</span>
            </div>
            <span className="font-display text-lg tracking-[0.3em] text-nude-600">AURA</span>
            <span className="text-xs tracking-widest text-nude-400">COSMETICS</span>
          </div>
          {/* Floating badges */}
          <div className="absolute top-8 -left-4 bg-white rounded-2xl p-3 shadow-medium animate-slide-up">
            <p className="text-xs font-medium text-charcoal">⭐ Best Seller</p>
            <p className="text-2xs text-charcoal-400">Velvet Matte Lipstick</p>
          </div>
          <div className="absolute bottom-12 -right-4 bg-white rounded-2xl p-3 shadow-medium" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs font-medium text-charcoal">🌿 Natural Formula</p>
            <p className="text-2xs text-charcoal-400">Dermatologist Tested</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Categories ───────────────────────────────────────────────────────────────

const CATEGORY_FALLBACK = [
  { name: 'Makeup', icon: '💄', slug: 'makeup' },
  { name: 'Skincare', icon: '🌿', slug: 'skincare' },
  { name: 'Lip Care', icon: '💋', slug: 'lip-care' },
  { name: 'Eye Makeup', icon: '👁️', slug: 'eye-makeup' },
  { name: 'Face Care', icon: '✨', slug: 'face-care' },
  { name: 'Hair Care', icon: '💇', slug: 'hair-care' },
  { name: 'Fragrance', icon: '🌸', slug: 'fragrance' },
  { name: 'Accessories', icon: '🎀', slug: 'beauty-accessories' },
]

function FeaturedCategories({ categories }) {
  const items = categories.length > 0 ? categories.slice(0, 8) : CATEGORY_FALLBACK

  return (
    <section className="py-16 bg-white">
      <div className="container-aura">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-2">Explore</p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm text-nude hover:text-nude-700 font-medium transition-colors">
            All Categories <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
          {items.map((cat) => (
            <Link
              key={cat.slug || cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-nude-100/60 transition-all duration-200"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-ivory-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200 group-hover:bg-nude-100">
                {cat.icon || cat.image ? (
                  cat.image
                    ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-2xl" loading="lazy" />
                    : <span>{cat.icon}</span>
                ) : (
                  <span className="font-display text-xl text-nude">{cat.name[0]}</span>
                )}
              </div>
              <span className="text-xs font-medium text-charcoal-600 text-center leading-tight group-hover:text-nude transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Best Sellers ─────────────────────────────────────────────────────────────

function BestSellersSection({ products, loading }) {
  return (
    <section className="py-16 bg-ivory-100">
      <div className="container-aura">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-2">Our Picks</p>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Products our customers can't stop loving</p>
          </div>
          <Link to="/shop?is_best_seller=true" className="hidden sm:flex items-center gap-1 text-sm text-nude hover:text-nude-700 font-medium transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {(products.length > 0 ? products : PLACEHOLDER_PRODUCTS).slice(0, 8).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/shop?is_best_seller=true" className="btn-secondary px-8">
            View All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────

function PromoBanner() {
  return (
    <section className="py-12">
      <div className="container-aura">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-charcoal to-charcoal-600 p-10 md:p-16">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-nude/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-champagne/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <span className="inline-block bg-nude/20 text-nude text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
              Limited Time Offer
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-white leading-tight mb-4">
              Your Beauty Routine,
              <span className="text-champagne italic"> Elevated.</span>
            </h2>
            <p className="text-white/60 text-sm md:text-base mb-8 leading-relaxed">
              Get 10% off your first order with code <span className="font-semibold text-champagne">AURA10</span>. 
              Discover premium beauty essentials at unbeatable prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/shop" className="btn-primary bg-nude hover:bg-nude-700 px-8 py-3">
                Explore AURA <ArrowRight size={16} />
              </Link>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-3">
                <span className="text-xs text-white/60">Use code:</span>
                <span className="font-mono font-bold text-champagne text-sm tracking-widest">AURA10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── New Arrivals ─────────────────────────────────────────────────────────────

function NewArrivalsSection({ products, loading }) {
  return (
    <section className="py-16 bg-white">
      <div className="container-aura">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-2">Just Dropped</p>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Fresh additions to your beauty collection</p>
          </div>
          <Link to="/shop?is_new_arrival=true" className="hidden sm:flex items-center gap-1 text-sm text-nude hover:text-nude-700 font-medium transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {(products.length > 0 ? products : PLACEHOLDER_PRODUCTS).slice(0, 8).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Shop by Concern ─────────────────────────────────────────────────────────

function ShopByConcern() {
  return (
    <section className="py-16 bg-ivory">
      <div className="container-aura">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-3">Personalised For You</p>
          <h2 className="section-title">Shop by Concern</h2>
          <p className="section-subtitle mt-2">Find products that address your unique skin needs</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {CONCERNS.map(({ label, emoji, to }) => (
            <Link
              key={label}
              to={to}
              className="group bg-white rounded-2xl p-5 text-center shadow-soft hover:shadow-product hover:-translate-y-1 transition-all duration-200 border border-nude-100/50"
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <p className="text-xs font-medium text-charcoal-600 group-hover:text-nude transition-colors">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Why AURA ─────────────────────────────────────────────────────────────────

function WhyAuraSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container-aura">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-3">Our Promise</p>
          <h2 className="section-title">Why Choose AURA?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_AURA.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-ivory hover:bg-nude-50 transition-colors border border-nude-100/50">
              <div className="w-14 h-14 rounded-2xl bg-nude-100 flex items-center justify-center mb-4">
                <Icon size={24} className="text-nude" />
              </div>
              <h3 className="font-medium text-sm text-charcoal mb-2">{title}</h3>
              <p className="text-xs text-charcoal-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="py-16 bg-ivory-100">
      <div className="container-aura">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-3">Real Stories</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-product transition-shadow">
              <Rating rating={t.rating} showCount={false} className="mb-4" />
              <p className="text-sm text-charcoal-500 leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-nude-100">
                <div className="w-9 h-9 rounded-full bg-nude/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-nude">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-charcoal">{t.name}</p>
                  <p className="text-2xs text-charcoal-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Social / Instagram ───────────────────────────────────────────────────────

function SocialSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container-aura">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.3em] text-nude uppercase mb-3">@aura.cosmetics</p>
          <h2 className="section-title">Follow Our Journey</h2>
          <p className="section-subtitle mt-2">Tag us for a chance to be featured</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {SOCIAL_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`aspect-square rounded-xl bg-gradient-to-br ${post.gradient} flex items-center justify-center hover:opacity-90 hover:scale-95 transition-all duration-200 overflow-hidden`}
              aria-label="View on Instagram"
            >
              <span className="font-display text-3xl text-nude/40">A</span>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-8"
          >
            Follow @aura.cosmetics
          </a>
        </div>
      </div>
    </section>
  )
}

// Minimal placeholder products for when API has no data yet
const PLACEHOLDER_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: ['Velvet Matte Lipstick', 'Glow Foundation', 'Hydrating Serum', 'Vitamin C Serum',
         'Nude Eyeshadow Palette', 'Daily Moisturizer', 'Waterproof Mascara', 'Beauty Blender'][i],
  slug: `placeholder-${i}`,
  price: [399, 799, 1199, 999, 1499, 699, 549, 299][i],
  mrp: [499, 999, 1499, 1299, 1799, 899, 699, 399][i],
  effective_price: [399, 799, 1199, 999, 1499, 699, 549, 299][i],
  discount_percent: [20, 20, 20, 23, 17, 22, 21, 25][i],
  rating: [4.8, 4.6, 4.9, 4.7, 4.5, 4.8, 4.6, 4.7][i],
  review_count: [245, 189, 312, 278, 156, 198, 167, 234][i],
  is_new_arrival: i > 3,
  is_best_seller: i <= 3,
  is_in_stock: true,
  brand_name: 'AURA',
  primary_image: null,
  savings: 100,
}))
