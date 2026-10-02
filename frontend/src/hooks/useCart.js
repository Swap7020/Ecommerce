import { useSelector, useDispatch } from 'react-redux'
import {
  fetchCart, addToCart, updateCartItem,
  removeCartItem, clearCart,
  openCart, closeCart, toggleCart,
} from '@/store/slices/cartSlice'

export const useCart = () => {
  const dispatch = useDispatch()
  const { items, subtotal, total_items, isLoading, isOpen } = useSelector(s => s.cart)

  return {
    items,
    subtotal,
    total_items,
    isLoading,
    isOpen,
    fetchCart: () => dispatch(fetchCart()),
    addToCart: (productId, variantId, quantity) =>
      dispatch(addToCart({ productId, variantId, quantity })),
    updateItem: (itemId, quantity) => dispatch(updateCartItem({ itemId, quantity })),
    removeItem: (itemId) => dispatch(removeCartItem(itemId)),
    clearCart: () => dispatch(clearCart()),
    openCart: () => dispatch(openCart()),
    closeCart: () => dispatch(closeCart()),
    toggleCart: () => dispatch(toggleCart()),
  }
}
