import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { resetCart } from '@/store/slices/cartSlice'
import { authService } from '@/services/authService'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, error } = useSelector((s) => s.auth)

  const handleLogout = async () => {
    const refresh = localStorage.getItem('aura_refresh')
    try {
      if (refresh) await authService.logout(refresh)
    } catch (_) {}
    dispatch(logout())
    dispatch(resetCart())
  }

  return { user, isAuthenticated, isLoading, error, logout: handleLogout }
}
