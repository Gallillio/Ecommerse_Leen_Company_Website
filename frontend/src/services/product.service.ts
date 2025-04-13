import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  stock: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    description: string;
  };
}

export const ProductService = {
  async getFeaturedProducts(): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products/all`);
    return response.data;
  },

  async getAllProducts(filters?: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);

    const response = await axios.get(`${API_URL}/products?${params.toString()}`);
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  async getCategories(): Promise<{ id: string; name: string }[]> {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  }
}; 