export interface Suggestion {
  id: number
  ean: string
  name: string
  category: string | null
  brand: string | null
  supermarket: string
  price: number
  created_at: Date
}

export type CreateSuggestionInput = Omit<Suggestion, 'id' | 'created_at'>
