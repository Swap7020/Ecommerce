import api from './api'

export const reviewService = {
  getReviews: (productSlug, params = {}) =>
    api.get('/reviews/', { params: { product: productSlug, ...params } }).then(r => r.data),
  createReview: (data) => api.post('/reviews/create/', data).then(r => r.data),
  updateReview: (id, data) => api.patch(`/reviews/${id}/`, data).then(r => r.data),
  deleteReview: (id) => api.delete(`/reviews/${id}/`).then(r => r.data),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful/`).then(r => r.data),
}
