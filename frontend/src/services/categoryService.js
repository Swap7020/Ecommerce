import api from './api'

export const categoryService = {
  getCategories: () => api.get('/categories/').then(r => r.data),
  getCategory: (slug) => api.get(`/categories/${slug}/`).then(r => r.data),
  getConcerns: () => api.get('/categories/concerns/').then(r => r.data),
}
