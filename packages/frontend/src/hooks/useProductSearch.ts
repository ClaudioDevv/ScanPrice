import { useState } from 'react'
import { getProduct, getAlternatives } from '../services/productService'
import type { Product } from '../types/product'

export function useProductSearch() {
  const [ean, setEan] = useState('')
  const [supermarket, setSupermarket] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [alternatives, setAlternatives] = useState<Product[]>([])
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
        const altData = await getAlternatives(eanCode, supermarketName)
        if (altData.success) setAlternatives(altData.data)
      } else {
        setNotFound(true)
      }
    } catch {
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