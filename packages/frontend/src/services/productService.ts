import { API_URL } from '../config/env'
import type { ApiResponse, Product, SuggestionPayload, SuggestionResponse } from '../types/product'

export async function getProduct(ean: string, supermarket: string): Promise<ApiResponse<Product>> {
  const res = await fetch(`${API_URL}/products/${ean}?supermarket=${supermarket}`)
  return res.json()
}

export async function getAlternatives(ean: string, supermarket: string): Promise<ApiResponse<Product[]>> {
  const res = await fetch(`${API_URL}/products/${ean}/alternatives?supermarket=${supermarket}`)
  return res.json()
}

export async function postSuggestion(data: SuggestionPayload): Promise<SuggestionResponse> {
  const res = await fetch(`${API_URL}/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}