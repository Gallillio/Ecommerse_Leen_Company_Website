import api from './api'

interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  search?: string
}

export const productService = {
  async getProducts(filters: ProductFilters = {}) {
    const response = await api.get('/products', { params: filters })
    return response.data
  },

  async getProductById(id: string) {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  async getCategories() {
    const response = await api.get('/products/categories')
    return response.data
  },

  async createProduct(data: FormData) {
    const response = await api.post('/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateProduct(id: string, data: FormData) {
    const response = await api.put(`/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
} 