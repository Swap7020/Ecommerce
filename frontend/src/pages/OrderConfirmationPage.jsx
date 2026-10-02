import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, Truck, MapPin, ArrowRight } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/utils/formatters'
import { Skeleton } from '@/components/common/Skeleton'
import clsx from 'clsx'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrder(id).then(setOrder).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="container-aura py-20 space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-40 w-full max-w-lg mx-auto" />
    </div>
  )

  if (!order) return (
    <div className="container-aura py-20 text-center">
      <p className="text-charcoal-400">Order not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-ivory-100 py-12">
      <div className="container-aura max-w-2xl">
        {/* Success header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-display text-3xl text-charcoal mb-2">Order Placed!</h1>
          <p className="text-charcoal-400">
            Thank you for shopping with AURA. Your order <span className="font-semibold text-charcoal">#{order.order_number}</span> is confirmed.
          </p>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm border-b border-nude-100 pb-5 mb-5">
            {[
              { label: 'Order ID', value: `#${order.order_number}` },
              { label: 'Date', value: formatDate(order.created_at) },
              { label: 'Total', value: formatPrice(order.total) },
              { label: 'Status', value: (
                <span className={clsx('badge', getOrderStatusColor(order.order_status))}>
                  {getOrderStatusLabel(order.order_status)}
                </span>
              )},
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xs text-charcoal-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="font-semibold text-charcoal">{value}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="space-y-3 mb-5">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-lg bg-nude-50 overflow-hidden shrink-0">
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-charcoal">{item.product_name}</p>
                  {item.variant_name && <p className="text-charcoal-400 text-xs">{item.variant_name}</p>}
                  <p className="text-charcoal-400 text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-sm">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm border-t border-nude-100 pt-4">
            <div className="flex justify-between">
              <span className="text-charcoal-400">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-charcoal-400">Shipping</span>
              <span>{parseFloat(order.shipping_charge) === 0 ? 'FREE' : formatPrice(order.shipping_charge)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-nude-100">
              <span>Total Paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-2xl p-5 shadow-soft mb-5 flex gap-3">
          <MapPin size={18} className="text-nude shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-charcoal mb-0.5">Delivering to</p>
            <p className="text-charcoal-500">{order.shipping_full_name}</p>
            <p className="text-charcoal-500">{order.shipping_address_line1}, {order.shipping_city} - {order.shipping_pincode}</p>
            <p className="text-charcoal-500">{order.shipping_phone}</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/account/orders" className="btn-secondary flex-1 justify-center">
            <Package size={16} /> Track Order
          </Link>
          <Link to="/shop" className="btn-primary flex-1 justify-center">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
