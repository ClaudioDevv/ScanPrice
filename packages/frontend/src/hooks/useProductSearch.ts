import { useState } from 'react'
import { getProduct, getAlternatives } from '../services/productService'

export function useProductSearch() {
  const [ean, setEan] = useState('')
  const [supermarket, setSupermarket] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  async function searchProduct(eanCode: string, supermarketName: string) {
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setAlternatives([])

    try {
      const data = await getProduct(eanCode, supermarketName)

      if (data.success && data.data) {
        setProduct(data.data)
        const altRes = await fetch(`http://localhost:3000/api/products/${eanCode}/alternatives?supermarket=${supermarketName}`)
        const altData = await altRes.json()
        if (altData.success) setAlternatives(altData.data)
      } else {
        setNotFound(true)
      }
    } catch (e) {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setProduct(null)
    setAlternatives([])
    setNotFound(false)
    setEan('')
    setSupermarket('')
  }

  return {
    ean, setEan,
    supermarket, setSupermarket,
    product, alternatives,
    notFound, loading,
    searchProduct, reset
  }
}