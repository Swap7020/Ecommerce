import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/hooks/useAuth'
import SearchBar from '@/components/common/SearchBar'
import clsx from 'clsx'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  {
    label: 'Categories',
    children: [
      { to: '/shop?category=makeup', label: 'Makeup' },
      { to: '/shop?category=skincare', label: 'Skincare' },
      { to: '/shop?category=lip-care', label: 'Lip Care' },
      { to: '/shop?category=eye-makeup', label: 'Eye Makeup' },
      { to: '/shop?category=face-care', label: 'Face Care' },
      { to: '/shop?category=hair-care', label: 'Hair Care' },
      { to: '/shop?category=fragrance', label: 'Fragrance' },
    ],
  },
  { to: '/shop?is_new_arrival=true', label: 'New Arrivals' },
  { to: '/shop?is_best_seller=true', label: 'Best Sellers' },
  { to: '/shop?discount=true', label: 'Offers' },
  { to: '/about', label: 'About' },
]

export default function Navbar({ minimal = false }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdown, setDropdown] = useState(null)
  const navigate = useNavigate()

  const { total_items, toggleCart } = useCart()
  const { item_count } = useWishlist()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  if (minimal) {
    return (
      <header className="sticky top-0 z-40 bg-white border-b border-nude-100">
        <div className="container-aura flex items-center justify-between h-16">
          <Link to="/" className="font-display text-2xl font-semibold tracking-widest text-charcoal">
            AURA
          </Link>
          <span className="text-sm text-charcoal-400">Secure Checkout</span>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSearchOpen(false)}>
          <div className="container-aura pt-24" onClick={e => e.stopPropagation()}>
            <SearchBar onClose={() => setSearchOpen(false)} autoFocus />
          </div>
        </div>
      )}

      <header className={clsx(
        'sticky top-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft'
          : 'bg-white'
      )}>
        <div className="container-aura">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              to="/"
              className="font-display text-2xl lg:text-3xl font-semibold tracking-[0.2em] text-charcoal hover:text-nude transition-colors"
            >
              AURA
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative"
                    onMouseEnter={() => setDropdown(link.label)}
                    onMouseLeave={() => setDropdown(null)}
                  >
                    <button className={clsx(
                      'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      'text-charcoal-500 hover:text-charcoal hover:bg-ivory'
                    )}>
                      {link.label}
                      <ChevronDown size={14} className={clsx(
                        'transition-transform duration-200',
                        dropdown === link.label && 'rotate-180'
                      )} />
                    </button>
                    {dropdown === link.label && (
                      <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-medium border border-nude-100 py-2 animate-slide-down">
                        {link.children.map(child => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className="block px-4 py-2 text-sm text-charcoal-500 hover:text-nude hover:bg-ivory-100 transition-colors"
                            onClick={() => setDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => clsx(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'text-nude bg-nude-100/50'
                        : 'text-charcoal-500 hover:text-charcoal hover:bg-ivory'
                    )}
                  >
                    {link.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-icon"
                aria-label="Search"
              >
                <Search size={20} className="text-charcoal-500" />
              </button>

              <Link to="/wishlist" className="btn-icon relative" aria-label="Wishlist">
                <Heart size={20} className="text-charcoal-500" />
                {item_count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-nude rounded-full text-white text-2xs flex items-center justify-center font-bold">
                    {item_count > 9 ? '9+' : item_count}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleCart}
                className="btn-icon relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} className="text-charcoal-500" />
                {total_items > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-nude rounded-full text-white text-2xs flex items-center justify-center font-bold animate-bounce-soft">
                    {total_items > 9 ? '9+' : total_items}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <Link to="/account" className="btn-icon" aria-label="My Account">
                  {user?.profile?.profile_image ? (
                    <img
                      src={user.profile.profile_image}
                      alt={user.first_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-nude/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-nude">
                        {user?.first_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:block btn-secondary py-2 px-4 text-xs">
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="lg:hidden btn-icon ml-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-2xl font-semibold tracking-widest">AURA</span>
                <button onClick={() => setMobileOpen(false)} className="btn-icon">
                  <X size={20} />
                </button>
              </div>

              {isAuthenticated && (
                <div className="flex items-center gap-3 p-4 bg-ivory rounded-xl mb-6">
                  <div className="w-10 h-10 rounded-full bg-nude/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-nude">
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.full_name}</p>
                    <p className="text-xs text-charcoal-400">{user?.email}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {NAV_LINKS.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <p className="px-3 py-2 text-xs font-semibold text-charcoal-400 uppercase tracking-widest mt-4">
                        {link.label}
                      </p>
                      {link.children.map(child => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-charcoal-500 hover:text-nude hover:bg-ivory rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => clsx(
                        'block px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                        isActive ? 'bg-nude text-white' : 'text-charcoal hover:bg-ivory'
                      )}
                    >
                      {link.label}
                    </NavLink>
                  )
                )}
              </nav>

              <div className="mt-8 pt-6 border-t border-nude-100 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/account" onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center">
                      My Account
                    </Link>
                    <Link to="/account/orders" onClick={() => setMobileOpen(false)} className="btn-ghost w-full justify-center">
                      My Orders
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
