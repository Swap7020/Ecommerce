import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Login failed.' })
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Registration failed.' })
    }
  }
)

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile()
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(data)
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)

// ── Slice ──────────────────────────────────────────────────────────────────────

const storedUser = JSON.parse(localStorage.getItem('aura_user') || 'null')
const storedToken = localStorage.getItem('aura_access') || null

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    accessToken: storedToken,
    isLoading: false,
    isAuthenticated: !!storedToken,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('aura_access')
      localStorage.removeItem('aura_refresh')
      localStorage.removeItem('aura_user')
    },
    setTokens(state, action) {
      state.accessToken = action.payload.access
      state.isAuthenticated = true
      localStorage.setItem('aura_access', action.payload.access)
      if (action.payload.refresh) {
        localStorage.setItem('aura_refresh', action.payload.refresh)
      }
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.access
        state.isAuthenticated = true
        localStorage.setItem('aura_access', action.payload.access)
        localStorage.setItem('aura_refresh', action.payload.refresh)
        localStorage.setItem('aura_user', JSON.stringify(action.payload.user))
        toast.success(`Welcome back, ${action.payload.user.first_name || 'there'}!`)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.access
        state.isAuthenticated = true
        localStorage.setItem('aura_access', action.payload.access)
        localStorage.setItem('aura_refresh', action.payload.refresh)
        localStorage.setItem('aura_user', JSON.stringify(action.payload.user))
        toast.success('Account created! Welcome to AURA.')
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Fetch Profile
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('aura_user', JSON.stringify(action.payload))
      })

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('aura_user', JSON.stringify(action.payload))
        toast.success('Profile updated successfully.')
      })
  },
})

export const { logout, setTokens, clearError } = authSlice.actions
export default authSlice.reducer
