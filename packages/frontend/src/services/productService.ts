const API_URL = 'http://localhost:3000/api'

export async function getProduct(ean: string, supermarket: string) {
  const res = await fetch(`${API_URL}/products/${ean}?supermarket=${supermarket}`)
  return res.json()
}

export async function getAlternatives(ean: string, supermarket: string) {
  const res = await fetch(`${API_URL}/products/${ean}/alternatives?supermarket=${supermarket}`)
  return res.json()
}

export async function postSuggestion(data: {
  ean: string
  name: string
  brand: string
  category: string
  price: number
  supermarket: string
}) {
  const res = await fetch(`${API_URL}/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}