import { ProductBasic, ProductDetail, Subcategory } from '../types/mercadona.types'
import { fetchJson, log } from '../utils/utils'

const BASE_URL = 'https://tienda.mercadona.es/api'

// Supercategorías a excluir (no alimentarias)
const EXCLUDED_SUPER_IDS = new Set([20, 21, 22, 23, 24, 26, 25])

/**
 * Mercadona Scraper
 * Flujo:
 *   1. GET /api/categories/          → supercategorías + subcategorías
 *   2. GET /api/categories/{sub_id}  → productos por subcategoría (con precio)
 *   3. GET /api/products/{prod_id}   → EAN + detalles (solo productos nuevos)
 *   4. Upsert en PostgreSQL
 */

export async function getAllSubcategoryIds (): Promise<Subcategory[]> {
  const data = await fetchJson<{ results: any[] }>(`${BASE_URL}/categories/`)
  if (!data) return []

  const subcats: Subcategory[] = []

  for (const supercat of data.results) {
    if (EXCLUDED_SUPER_IDS.has(supercat.id)) {
      log(`Skipping supercat [${supercat.id}] ${supercat.name}`)
      continue
    }
    for (const sub of supercat.categories ?? []) {
      subcats.push({
        subId: sub.id,
        subName: sub.name,
        superId: supercat.id,
        superName: supercat.name,
      })
    }
  }

  log(`Subcategorías a procesar: ${subcats.length}`)
  return subcats
}

export async function getProductsFromSubcat (subcat: Subcategory): Promise<ProductBasic[]> {
  const data = await fetchJson<{ categories: any[] }>(`${BASE_URL}/categories/${subcat.subId}`)
  if (!data) return []

  const products: ProductBasic[] = []

  for (const group of data.categories ?? []) {
    for (const p of group.products ?? []) {
      const pi = p.price_instructions ?? {}
      products.push({
        productId: p.id,
        name: p.display_name ?? '',
        price: parseFloat(pi.unit_price ?? '0'),
        imageUrl: p.thumbnail ?? '',
        category: subcat.superName,
        slug: p.slug ?? '',
      })
    }
  }

  return products
}

export async function getProductDetail (product: ProductBasic): Promise<ProductDetail | null> {
  const data = await fetchJson<any>(`${BASE_URL}/products/${product.productId}`)
  if (!data) return null

  return {
    ...product,
    ean: data.ean ?? '',
    brand: data.brand ?? data.details?.brand ?? '',
  }
}
