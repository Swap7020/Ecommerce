import api from './api'

export const wishlistService = {
  getWishlist: () => api.get('/wishlist/').then(r => r.data),
  toggle: (productId) => api.post(`/wishlist/${productId}/`).then(r => r.data),
  checkProducts: (ids) => api.get('/wishlist/check/', { params: { product_ids: ids.join(',') } }).then(r => r.data),
}
