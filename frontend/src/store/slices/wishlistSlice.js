import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { wishlistService } from '@/services/wishlistService'
import toast from 'react-hot-toast'

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  return await wishlistService.getWishlist()
})

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await wishlistService.toggle(productId)
      return { productId, ...data }
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    wishlistIds: [],
    item_count: 0,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload?.items || []
        state.item_count = action.payload?.item_count || 0
        state.wishlistIds = state.items.map(i => i.product.id)
        state.isLoading = false
      })
      .addCase(fetchWishlist.pending, (state) => { state.isLoading = true })

      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, in_wishlist, message } = action.payload
        if (in_wishlist) {
          state.wishlistIds.push(productId)
          toast.success('Added to wishlist ♡')
        } else {
          state.wishlistIds = state.wishlistIds.filter(id => id !== productId)
          state.items = state.items.filter(item => item.product.id !== productId)
          state.item_count = Math.max(0, state.item_count - 1)
          toast.success('Removed from wishlist.')
        }
      })
      .addCase(toggleWishlist.rejected, (_, action) => {
        toast.error(action.payload?.error || 'Please login to use wishlist.')
      })
  },
})

export default wishlistSlice.reducer
