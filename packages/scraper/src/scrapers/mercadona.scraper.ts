/**
 * Mercadona Scraper
 * Flujo:
 *   1. GET /api/categories/          → supercategorías + subcategorías
 *   2. GET /api/categories/{sub_id}  → productos por subcategoría (con precio)
 *   3. GET /api/products/{prod_id}   → EAN + detalles (solo productos nuevos)
 *   4. Upsert en PostgreSQL
 */

import { ProductBasic, ProductDetail, Subcategory } from '../types/mercadona.types'

const BASE_URL = 'https://tienda.mercadona.es/api'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; scraper/1.0)',
  Accept: 'application/json',
}

// Supercategorías a excluir (no alimentarias)
const EXCLUDED_SUPER_IDS = new Set([20, 21, 22, 23, 24, 26, 25])

// #########################
// Funciones Auxiliares
// #########################

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function log (msg: string) {
  console.log(`[${new Date().toTimeString().slice(0, 8)}] ${msg}`)
}

async function fetchJson<T> (url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) {
      log(`HTTP ${res.status} → ${url}`)
      return null
    }
    const data = await res.json()
    return data
  } catch (err) {
    log(`Error fetching ${url}: ${err}`)
    return null
  }
}

/** Limita la concurrencia de un array de promesas */
export async function runWithConcurrency<T> (tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = []
  let index = 0

  async function worker () {
    while (index < tasks.length) {
      const current = index++
      const task = tasks[current]

      if (task) {
        results[current] = await task()
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

// ─── API ──────────────────────────────────────────────────────────────────────

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
