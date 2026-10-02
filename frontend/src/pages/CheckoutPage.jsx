import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Check, ChevronRight, CreditCard, Truck, MapPin, Package, Lock } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { orderService } from '@/services/orderService'
import { formatPrice } from '@/utils/formatters'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Delivery', icon: Truck },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Review', icon: Package },
]

const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Razorpay', desc: 'UPI, Cards, Net Banking', icon: '💳' },
  { id: 'stripe', label: 'Stripe', desc: 'International Cards', icon: '🌐' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, total_items } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [deliveryOption] = useState('standard')

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const subtotalNum = parseFloat(subtotal) || 0
  const discount = couponData ? parseFloat(couponData.discount_amount) : 0
  const shipping = (subtotalNum - discount) >= 999 || couponData?.free_shipping ? 0 : 79
  const tax = (subtotalNum - discount) * 0.18
  const total = subtotalNum - discount + shipping + tax

  useEffect(() => {
    if (items.length === 0) navigate('/cart')
    authService.getAddresses().then(data => {
      setAddresses(data.results || data || [])
      const def = (data.results || data || []).find(a => a.is_default)
      if (def) setSelectedAddress(def)
    }).catch(() => {})
  }, [])

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const data = await orderService.validateCoupon(couponCode.toUpperCase(), subtotalNum)
      setCouponData(data)
      toast.success(`Coupon applied! Saved ${formatPrice(data.discount_amount)}`)
    } catch (err) {
      setCouponData(null)
      toast.error(err.response?.data?.error || 'Invalid coupon.')
    }
  }

  const onAddressSubmit = (data) => {
    setUseNewAddress(true)
    setSelectedAddress({ ...data, _isNew: true })
    setStep(2)
  }

  const placeOrder = async () => {
    setPlacing(true)
    try {
      const addr = selectedAddress
      const payload = {
        payment_method: paymentMethod,
        coupon_code: couponData?.code || '',
      }
      if (addr._isNew || !addr.id) {
        Object.assign(payload, {
          full_name: addr.full_name,
          phone: addr.phone,
          address_line1: addr.address_line1,
          address_line2: addr.address_line2 || '',
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country || 'India',
        })
      } else {
        payload.address_id = addr.id
      }
      const order = await orderService.checkout(payload)
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${order.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-100 pb-12">
      <div className="container-aura py-6 max-w-5xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                  step === s.id ? 'bg-nude text-white' :
                  step > s.id ? 'text-nude cursor-pointer hover:bg-nude-100' :
                  'text-charcoal-300 cursor-default'
                )}
              >
                {step > s.id ? (
                  <Check size={14} />
                ) : (
                  <s.icon size={14} />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-nude-200 mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">

            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-soft animate-fade-in">
                <h2 className="font-serif text-xl text-charcoal mb-6">Delivery Address</h2>

                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {addresses.map(addr => (
                      <label
                        key={addr.id}
                        className={clsx(
                          'flex gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                          selectedAddress?.id === addr.id ? 'border-nude bg-nude-50' : 'border-nude-100 hover:border-nude-200'
                        )}
                      >
                        <input
                          type="radio"
                          checked={selectedAddress?.id === addr.id && !useNewAddress}
                          onChange={() => { setSelectedAddress(addr); setUseNewAddress(false) }}
                          className="mt-1 text-nude"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-charcoal">{addr.full_name}</p>
                          <p className="text-charcoal-400 mt-0.5">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                          </p>
                          <p className="text-charcoal-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-charcoal-400">{addr.phone}</p>
                          {addr.is_default && (
                            <span className="badge-nude text-2xs mt-1 inline-block">Default</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* New address form */}
                <details open={addresses.length === 0} className="group">
                  <summary className="cursor-pointer text-sm font-medium text-nude mb-4 list-none flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-nude flex items-center justify-center text-xs">+</span>
                    Add new address
                  </summary>
                  <form onSubmit={handleSubmit(onAddressSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="sm:col-span-2">
                      <label className="label">Full Name</label>
                      <input {...register('full_name', { required: 'Required' })} className={clsx('input', errors.full_name && 'input-error')} placeholder="Your full name" defaultValue={user?.full_name} />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input {...register('phone', { required: 'Required' })} className={clsx('input', errors.phone && 'input-error')} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="label">Pincode</label>
                      <input {...register('pincode', { required: 'Required' })} className={clsx('input', errors.pincode && 'input-error')} placeholder="110001" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Address Line 1</label>
                      <input {...register('address_line1', { required: 'Required' })} className={clsx('input', errors.address_line1 && 'input-error')} placeholder="House/Flat No, Street, Area" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Address Line 2 (optional)</label>
                      <input {...register('address_line2')} className="input" placeholder="Landmark, etc." />
                    </div>
                    <div>
                      <label className="label">City</label>
                      <input {...register('city', { required: 'Required' })} className={clsx('input', errors.city && 'input-error')} placeholder="Mumbai" />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input {...register('state', { required: 'Required' })} className={clsx('input', errors.state && 'input-error')} placeholder="Maharashtra" />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" className="btn-primary w-full">
                        Use This Address
                      </button>
                    </div>
                  </form>
                </details>

                {addresses.length > 0 && !useNewAddress && selectedAddress && (
                  <button onClick={() => setStep(2)} className="btn-primary w-full mt-6">
                    Continue to Delivery
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Delivery */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-soft animate-fade-in">
                <h2 className="font-serif text-xl text-charcoal mb-6">Delivery Options</h2>
                <div className="space-y-3">
                  {[
                    { id: 'standard', label: 'Standard Delivery', desc: '4–7 business days', price: shipping === 0 ? 'FREE' : formatPrice(79) },
                    { id: 'express', label: 'Express Delivery', desc: '1–2 business days', price: formatPrice(149) },
                  ].map(opt => (
                    <label
                      key={opt.id}
                      className={clsx(
                        'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                        deliveryOption === opt.id ? 'border-nude bg-nude-50' : 'border-nude-100 hover:border-nude-200'
                      )}
                    >
                      <input type="radio" checked={deliveryOption === opt.id} onChange={() => {}} className="text-nude" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-charcoal">{opt.label}</p>
                        <p className="text-xs text-charcoal-400">{opt.desc}</p>
                      </div>
                      <span className={clsx('text-sm font-semibold', opt.price === 'FREE' ? 'text-green-600' : 'text-charcoal')}>
                        {opt.price}
                      </span>
                    </label>
                  ))}
                </div>
                <button onClick={() => setStep(3)} className="btn-primary w-full mt-6">
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-soft animate-fade-in">
                <h2 className="font-serif text-xl text-charcoal mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(pm => (
                    <label
                      key={pm.id}
                      className={clsx(
                        'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                        paymentMethod === pm.id ? 'border-nude bg-nude-50' : 'border-nude-100 hover:border-nude-200'
                      )}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="text-nude"
                      />
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-charcoal">{pm.label}</p>
                        <p className="text-xs text-charcoal-400">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-charcoal-400">
                  <Lock size={12} /> Your payment information is encrypted and secure.
                </div>
                <button onClick={() => setStep(4)} className="btn-primary w-full mt-6">
                  Review Order
                </button>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="bg-white rounded-2xl p-6 shadow-soft animate-fade-in">
                <h2 className="font-serif text-xl text-charcoal mb-6">Review Your Order</h2>

                {/* Address summary */}
                <div className="p-4 bg-ivory rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest">Delivering to</p>
                    <button onClick={() => setStep(1)} className="text-xs text-nude">Edit</button>
                  </div>
                  {selectedAddress && (
                    <div className="text-sm text-charcoal">
                      <p className="font-medium">{selectedAddress.full_name}</p>
                      <p className="text-charcoal-500">{selectedAddress.address_line1}, {selectedAddress.city} {selectedAddress.pincode}</p>
                      <p className="text-charcoal-500">{selectedAddress.phone}</p>
                    </div>
                  )}
                </div>

                {/* Payment summary */}
                <div className="p-4 bg-ivory rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest">Payment</p>
                    <button onClick={() => setStep(3)} className="text-xs text-nude">Edit</button>
                  </div>
                  <p className="text-sm text-charcoal">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
                </div>

                {/* Cart items */}
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-14 rounded-lg bg-nude-50 overflow-hidden shrink-0">
                        {item.product?.primary_image && (
                          <img src={item.product.primary_image.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-charcoal line-clamp-1">{item.product?.name}</p>
                        <p className="text-charcoal-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(parseFloat(item.unit_price) * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="btn-primary w-full py-4 text-base"
                >
                  {placing ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : `Place Order · ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-soft sticky top-24">
              <h3 className="font-serif text-base text-charcoal mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-400">Subtotal ({total_items} items)</span>
                  <span>{formatPrice(subtotalNum)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal-400">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-400">Tax (GST 18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-nude-100 mt-3">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-5">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="input py-2 text-xs flex-1"
                  />
                  <button onClick={applyCoupon} className="btn-secondary px-3 py-2 text-xs">Apply</button>
                </div>
                {couponData && (
                  <p className="text-xs text-green-600 mt-1.5">✓ {couponData.code} applied</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
