import api from './api'

export const productService = {
  getProducts: (params = {}) => api.get('/products/', { params }).then(r => r.data),
  getProduct: (slug) => api.get(`/products/${slug}/`).then(r => r.data),
  getFeatured: () => api.get('/products/featured/').then(r => r.data),
  getBestSellers: () => api.get('/products/best-sellers/').then(r => r.data),
  getNewArrivals: () => api.get('/products/new-arrivals/').then(r => r.data),
  getSearchSuggestions: (q) => api.get('/products/search-suggestions/', { params: { q } }).then(r => r.data),
  getHomepageData: () => api.get('/products/homepage/').then(r => r.data),

  // Brands
  getBrands: () => api.get('/products/brands/').then(r => r.data),
  getBrand: (slug) => api.get(`/products/brands/${slug}/`).then(r => r.data),

  // Banners
  getBanners: () => api.get('/products/banners/').then(r => r.data),
  getPromotionalBanners: () => api.get('/products/promotional-banners/').then(r => r.data),
}
