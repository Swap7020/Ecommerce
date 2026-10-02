import api from './api'

export const cartService = {
  getCart: () => api.get('/cart/').then(r => r.data),
  addItem: (data) => api.post('/cart/items/', data).then(r => r.data),
  updateItem: (itemId, data) => api.patch(`/cart/items/${itemId}/`, data).then(r => r.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/`).then(r => r.data),
  clearCart: () => api.delete('/cart/').then(r => r.data),
  mergeCart: (sessionKey) => api.post('/cart/merge/', { session_key: sessionKey }).then(r => r.data),
}
