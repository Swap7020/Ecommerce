import { Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/utils/formatters'
import clsx from 'clsx'

const FREE_SHIPPING_THRESHOLD = 999

export default function CartDrawer() {
  const { items, subtotal, total_items, isOpen, closeCart, updateItem, removeItem, isLoading } = useCart()
  const navigate = useNavigate()

  const subtotalNum = parseFloat(subtotal) || 0
  const remaining = FREE_SHIPPING_THRESHOLD - subtotalNum
  const freeShippingProgress = Math.min((subtotalNum / FREE_SHIPPING_THRESHOLD) * 100, 100)

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div className={clsx(
        'fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nude-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-nude" />
            <h2 className="font-serif text-lg text-charcoal">
              Your Bag
              {total_items > 0 && (
                <span className="ml-2 text-sm font-sans text-charcoal-400">({total_items} items)</span>
              )}
            </h2>
          </div>
          <button onClick={closeCart} className="btn-icon" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotalNum > 0 && (
          <div className="px-6 py-3 bg-ivory-100 border-b border-nude-100">
            {remaining > 0 ? (
              <p className="text-xs text-charcoal-500 mb-2">
                You're <span className="font-semibold text-nude">{formatPrice(remaining)}</span> away from FREE shipping!
              </p>
            ) : (
              <p className="text-xs text-green-600 font-medium mb-2">🎉 You've unlocked FREE shipping!</p>
            )}
            <div className="w-full bg-nude-100 rounded-full h-1.5">
              <div
                className="bg-nude h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag size={48} className="text-nude-200 mb-4" />
              <p className="font-serif text-lg text-charcoal mb-2">Your bag is empty</p>
              <p className="text-sm text-charcoal-400 mb-6">Add some beautiful products!</p>
              <button onClick={closeCart} className="btn-primary">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQty={(qty) => updateItem(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-nude-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Subtotal</span>
              <span className="font-semibold text-charcoal text-lg">{formatPrice(subtotalNum)}</span>
            </div>
            <p className="text-xs text-charcoal-400 text-center">
              Shipping & taxes calculated at checkout
            </p>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full py-4 text-base justify-between"
            >
              <span>Checkout</span>
              <div className="flex items-center gap-1">
                <span>{formatPrice(subtotalNum)}</span>
                <ArrowRight size={18} />
              </div>
            </button>
            <Link
              to="/cart"
              onClick={closeCart}
              className="block text-center text-sm text-charcoal-400 hover:text-nude transition-colors"
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

function CartItem({ item, onUpdateQty, onRemove }) {
  const img = item.product?.primary_image

  return (
    <div className="flex gap-3">
      <div className="w-20 h-24 bg-nude-50 rounded-xl overflow-hidden shrink-0">
        {img ? (
          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-2xl text-nude-300">A</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xs font-semibold tracking-widest text-nude uppercase mb-0.5">
          {item.product?.brand_name}
        </p>
        <p className="text-sm font-medium text-charcoal line-clamp-2 leading-snug mb-1">
          {item.product?.name}
        </p>
        {item.variant && (
          <p className="text-xs text-charcoal-400">{item.variant.name}</p>
        )}
        <p className="text-sm font-semibold text-charcoal mt-1">
          {formatPrice(parseFloat(item.unit_price) * item.quantity)}
        </p>
        <div className="flex items-center justify-between mt-2">
          {/* Qty controls */}
          <div className="flex items-center gap-1 border border-nude-200 rounded-full px-1">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-6 h-6 flex items-center justify-center text-charcoal-500 hover:text-nude disabled:opacity-30 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-xs font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-charcoal-500 hover:text-nude transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-charcoal-300 hover:text-red-400 transition-colors p-1"
            aria-label="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
