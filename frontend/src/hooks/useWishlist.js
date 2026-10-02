import { useSelector, useDispatch } from 'react-redux'
import { toggleWishlist, fetchWishlist } from '@/store/slices/wishlistSlice'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export const useWishlist = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const { wishlistIds, items, item_count, isLoading } = useSelector(s => s.wishlist)

  const toggle = (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save to wishlist.')
      return
    }
    dispatch(toggleWishlist(productId))
  }

  const isInWishlist = (productId) => wishlistIds.includes(productId)

  return { items, wishlistIds, item_count, isLoading, toggle, isInWishlist, fetchWishlist: () => dispatch(fetchWishlist()) }
}
