import api from './api'

export const orderService = {
  getOrders: () => api.get('/orders/').then(r => r.data),
  getOrder: (id) => api.get(`/orders/${id}/`).then(r => r.data),
  checkout: (data) => api.post('/orders/checkout/', data).then(r => r.data),
  getOrderSummary: (data) => api.post('/orders/summary/', data).then(r => r.data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`).then(r => r.data),
  validateCoupon: (code, amount) => api.post('/coupons/validate/', { code, order_amount: amount }).then(r => r.data),
}
