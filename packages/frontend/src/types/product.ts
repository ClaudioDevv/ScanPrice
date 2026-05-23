export interface Product {
  id: number
  name: string
  category: string | null
  brand: string | null
  supermarket: string
  price: string
  normalized_name_id?: number
  image_url: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface SuggestionPayload {
  ean: string
  name: string
  brand: string
  category: string
  price: number
  supermarket: string
}

export interface SuggestionResponse {
  success: boolean
  message: string
  data: { id: number }
}
