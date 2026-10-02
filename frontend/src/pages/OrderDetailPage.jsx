import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, MapPin, CreditCard, ChevronRight } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '@/utils/formatters'
import Breadcrumb from '@/components/common/Breadcrumb'
import { Skeleton } from '@/components/common/Skeleton'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    orderService.getOrder(id).then(setOrder).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const updated = await orderService.cancelOrder(id)
      setOrder(updated)
      toast.success('Order cancelled.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel this order.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div className="container-aura py-10 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
  if (!order) return <div className="container-aura py-20 text-center text-charcoal-400">Order not found.</div>

  const currentStep = STATUS_STEPS.indexOf(order.order_status)
  const isCancelled = order.order_status === 'cancelled'
  const canCancel = ['pending', 'confirmed'].includes(order.order_status)

  return (
    <div className="min-h-screen bg-ivory-100 pb-12">
      <div className="container-aura py-6 max-w-3xl">
        <Breadcrumb items={[
          { to: '/', label: 'Home' }, { to: '/account', label: 'Account' },
          { to: '/account/orders', label: 'Orders' }, { label: `#${order.order_number}` }
        ]} />

        <div className="flex items-center justify-between mt-4 mb-7">
          <div>
            <h1 className="font-display text-2xl text-charcoal">Order #{order.order_number}</h1>
            <p className="text-xs text-charcoal-400 mt-1">Placed on {formatDate(order.created_at)}</p>
          </div>
          <span className={clsx('badge text-sm', getOrderStatusColor(order.order_status))}>
            {getOrderStatusLabel(order.order_status)}
          </span>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl p-6 shadow-soft mb-5">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                      i <= currentStep ? 'bg-nude text-white' : 'bg-nude-100 text-nude-300'
                    )}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className="text-2xs text-charcoal-400 mt-1 text-center hidden sm:block capitalize">
                      {s.replace('_', ' ')}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={clsx('flex-1 h-0.5 mx-1', i < currentStep ? 'bg-nude' : 'bg-nude-100')} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-5">
          <h2 className="font-serif text-lg text-charcoal mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-16 rounded-xl bg-nude-50 overflow-hidden shrink-0">
                  {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-charcoal">{item.product_name}</p>
                  {item.variant_name && <p className="text-xs text-charcoal-400">{item.variant_name}</p>}
                  <p className="text-xs text-charcoal-400">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                </div>
                <p className="font-semibold text-sm">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-nude-100 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-charcoal-400">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-charcoal-400">Shipping</span><span>{parseFloat(order.shipping_charge) === 0 ? 'FREE' : formatPrice(order.shipping_charge)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-nude-100">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Address + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3"><MapPin size={15} className="text-nude" /><p className="font-medium text-sm">Delivery Address</p></div>
            <p className="text-sm text-charcoal">{order.shipping_full_name}</p>
            <p className="text-xs text-charcoal-400">{order.shipping_address_line1}, {order.shipping_city} {order.shipping_pincode}</p>
            <p className="text-xs text-charcoal-400">{order.shipping_phone}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-2 mb-3"><CreditCard size={15} className="text-nude" /><p className="font-medium text-sm">Payment</p></div>
            <p className="text-sm text-charcoal capitalize">{order.payment_method?.replace('_', ' ')}</p>
            <p className={clsx('text-xs mt-0.5', order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600')}>
              {order.payment_status === 'paid' ? '✓ Payment received' : order.payment_status}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-secondary text-red-500 border-red-200 hover:bg-red-50">
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
