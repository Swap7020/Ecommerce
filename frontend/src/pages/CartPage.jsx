import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, Tag, ArrowRight, ShoppingBag, Truck } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/utils/formatters'
import { orderService } from '@/services/orderService'
import EmptyState from '@/components/common/EmptyState'
import Breadcrumb from '@/components/common/Breadcrumb'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const FREE_SHIPPING_THRESHOLD = 999
const SHIPPING_CHARGE = 79

export default function CartPage() {
  const { items, subtotal, total_items, fetchCart, updateItem, removeItem, isLoading } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => { fetchCart() }, [])

  const subtotalNum = parseFloat(subtotal) || 0
  const discount = couponData ? parseFloat(couponData.discount_amount) : 0
  const shipping = (subtotalNum - discount) >= FREE_SHIPPING_THRESHOLD || couponData?.free_shipping ? 0 : SHIPPING_CHARGE
  const tax = ((subtotalNum - discount) * 0.18)
  const total = subtotalNum - discount + shipping + tax
  const remaining = FREE_SHIPPING_THRESHOLD - subtotalNum

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const data = await orderService.validateCoupon(couponCode.toUpperCase(), subtotalNum)
      setCouponData(data)
      toast.success(`Coupon applied! You saved ${formatPrice(data.discount_amount)}`)
    } catch (err) {
      setCouponData(null)
      toast.error(err.response?.data?.error || 'Invalid coupon code.')
    } finally {
      setCouponLoading(false)
    }
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="container-aura py-10">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Cart' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Add some beautiful products from our collection."
          actionLabel="Continue Shopping"
          actionTo="/shop"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory-100">
      <div className="container-aura py-6">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Cart' }]} />
        <h1 className="font-display text-3xl text-charcoal mt-3 mb-8">
          Your Bag
          <span className="text-lg font-sans text-charcoal-400 ml-2">({total_items} items)</span>
        </h1>

        {remaining > 0 && (
          <div className="bg-nude-100/60 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Truck size={18} className="text-nude shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-charcoal">
                Add <span className="font-semibold text-nude">{formatPrice(remaining)}</span> more for FREE shipping!
              </p>
              <div className="w-full bg-white rounded-full h-1.5 mt-1.5">
                <div
                  className="bg-nude h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((subtotalNum / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQty={(qty) => updateItem(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-24">
              <h2 className="font-serif text-lg text-charcoal mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <label className="label">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="input py-2.5 text-xs flex-1"
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode}
                    className="btn-secondary px-3 py-2.5 text-xs"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponData && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                    <Tag size={12} />
                    <span>"{couponData.code}" applied</span>
                    <button onClick={() => setCouponData(null)} className="text-charcoal-400 hover:text-red-400 ml-auto">Remove</button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm border-t border-nude-100 pt-5">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Subtotal</span>
                  <span>{formatPrice(subtotalNum)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">GST (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-nude-100">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(isAuthenticated ? '/checkout' : '/login?next=/checkout')}
                className="btn-primary w-full py-4 mt-6 text-base justify-between"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <img src="https://img.icons8.com/ios-filled/24/C4956A/lock.png" alt="" className="w-3 h-3 opacity-60" />
                <span className="text-xs text-charcoal-400">Secure 256-bit SSL encrypted payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline import needed for truck icon removed — using lucide-react Truck above

function CartItemRow({ item, onUpdateQty, onRemove }) {
  const img = item.product?.primary_image

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft flex gap-4">
      <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-nude-50">
        {img ? (
          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-2xl text-nude-300">A</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xs font-semibold tracking-widest text-nude uppercase mb-0.5">{item.product?.brand_name}</p>
        <Link to={`/products/${item.product?.slug}`} className="text-sm font-medium text-charcoal hover:text-nude transition-colors line-clamp-2">
          {item.product?.name}
        </Link>
        {item.variant && <p className="text-xs text-charcoal-400 mt-0.5">{item.variant.name}</p>}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-nude-200 rounded-full px-1">
            <button onClick={() => onUpdateQty(item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 flex items-center justify-center text-charcoal-500 hover:text-nude disabled:opacity-30">
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
            <button onClick={() => onUpdateQty(item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-charcoal-500 hover:text-nude">
              <Plus size={12} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">{formatPrice(parseFloat(item.unit_price) * item.quantity)}</span>
            <button onClick={onRemove} className="text-charcoal-300 hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
