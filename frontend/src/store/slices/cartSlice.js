import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '@/services/cartService'
import toast from 'react-hot-toast'

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  return await cartService.getCart()
})

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, variantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await cartService.addItem({ product_id: productId, variant_id: variantId, quantity })
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await cartService.updateItem(itemId, { quantity })
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      return await cartService.removeItem(itemId)
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const clearCart = createAsyncThunk('cart/clear', async () => {
  return await cartService.clearCart()
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    subtotal: '0.00',
    total_items: 0,
    coupon_code: '',
    isLoading: false,
    isOpen: false,
    error: null,
  },
  reducers: {
    openCart(state) { state.isOpen = true },
    closeCart(state) { state.isOpen = false },
    toggleCart(state) { state.isOpen = !state.isOpen },
    resetCart(state) {
      state.items = []
      state.subtotal = '0.00'
      state.total_items = 0
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.isLoading = false
      if (action.payload) {
        state.items = action.payload.items || []
        state.subtotal = action.payload.subtotal || '0.00'
        state.total_items = action.payload.total_items || 0
        state.coupon_code = action.payload.coupon_code || ''
      }
    }

    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => { state.isLoading = false })

      .addCase(addToCart.pending, (state) => { state.isLoading = true })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action)
        toast.success('Added to cart!')
        state.isOpen = true
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        toast.error(action.payload?.error || 'Could not add to cart.')
      })

      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, (state, action) => {
        setCart(state, action)
        toast.success('Removed from cart.')
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
        state.subtotal = '0.00'
        state.total_items = 0
        state.isLoading = false
      })
  },
})

export const { openCart, closeCart, toggleCart, resetCart } = cartSlice.actions
export default cartSlice.reducer
