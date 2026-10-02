import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/utils/formatters'
import EmptyState from '@/components/common/EmptyState'
import Breadcrumb from '@/components/common/Breadcrumb'
import { Skeleton } from '@/components/common/Skeleton'
import clsx from 'clsx'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrders().then(data => setOrders(data.results || data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-ivory-100">
      <div className="container-aura py-6">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { to: '/account', label: 'Account' }, { label: 'Orders' }]} />
        <h1 className="font-display text-3xl text-charcoal mt-3 mb-8">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Your order history will appear here once you make a purchase."
            actionLabel="Start Shopping"
            actionTo="/shop"
          />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block bg-white rounded-2xl p-5 shadow-soft hover:shadow-product transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-charcoal text-sm">#{order.order_number}</p>
                      <span className={clsx('badge text-xs', getOrderStatusColor(order.order_status))}>
                        {getOrderStatusLabel(order.order_status)}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-400 mb-3">{formatDate(order.created_at)}</p>
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 4).map(item => (
                        <div key={item.id} className="w-10 h-12 rounded-lg border-2 border-white bg-nude-50 overflow-hidden">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                      {(order.items?.length || 0) > 4 && (
                        <div className="w-10 h-12 rounded-lg border-2 border-white bg-nude-100 flex items-center justify-center text-2xs text-nude font-medium">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal">{formatPrice(order.total)}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">{order.items?.length} items</p>
                    <ChevronRight size={16} className="text-nude mt-2 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
