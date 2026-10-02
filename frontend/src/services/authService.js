import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register/', data).then(r => r.data),
  login: (data) => api.post('/auth/login/', data).then(r => r.data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }).then(r => r.data),
  getProfile: () => api.get('/auth/profile/').then(r => r.data),
  updateProfile: (data) => api.patch('/auth/profile/', data).then(r => r.data),
  changePassword: (data) => api.post('/auth/change-password/', data).then(r => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }).then(r => r.data),
  resetPassword: (data) => api.post('/auth/reset-password/', data).then(r => r.data),
  verifyEmail: (token) => api.post('/auth/verify-email/', { token }).then(r => r.data),
  resendVerification: () => api.post('/auth/resend-verification/').then(r => r.data),

  // Addresses
  getAddresses: () => api.get('/auth/addresses/').then(r => r.data),
  createAddress: (data) => api.post('/auth/addresses/', data).then(r => r.data),
  updateAddress: (id, data) => api.patch(`/auth/addresses/${id}/`, data).then(r => r.data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}/`).then(r => r.data),
  setDefaultAddress: (id) => api.post(`/auth/addresses/${id}/set-default/`).then(r => r.data),
}
