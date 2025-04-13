import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

interface ProductsState {
  items: Product[]
  loading: boolean
  error: string | null
  selectedCategory: string | null
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: null,
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload
      state.loading = false
      state.error = null
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
  },
})

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setSelectedCategory,
} = productsSlice.actions
export default productsSlice.reducer 