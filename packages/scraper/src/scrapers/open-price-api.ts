import { OFFPriceItem, OFFResponse, ProductRow } from '../types/open-price-api.types'
import { fetchJson, log, sleep } from '../utils/utils'

export const LOCATION_ID = 4455        // Supeco Barcelona
export const SUPERMARKET_NAME = 'supeco'
const PAGE_SIZE = 100
const PAGE_DELAY = 300          // ms entre páginas (API pública)
const BASE_URL = 'https://prices.openfoodfacts.org/api/v1'

/**
 * Estrategia de nombre:
 *   1. product.product_name  → nombre limpio de Open Food Facts
 *   2. product_name (raíz)   → nombre de la etiqueta del supermercado
 *   3. "Producto sin nombre" → fallback
 */
function resolveName (item: OFFPriceItem): string {
  return (
    item.product?.product_name?.trim() ||
    item.product_name?.trim() ||
    'Producto sin nombre'
  )
}

function resolveBrand (item: OFFPriceItem): string {
  return item.product?.brands?.trim() || ''
}

function resolveCategory (item: OFFPriceItem): string {
  const tags = item.product?.categories_tags ?? []
  if (!tags.length) return ''

  // Busca la etiqueta en español primero, luego inglés
  const es = tags.find((t) => t.startsWith('es:'))
  if (es) return es.replace('es:', '')

  const en = tags.find((t) => t.startsWith('en:'))
  if (en) return en.replace('en:', '').replace(/-/g, ' ')

  return ''
}

function resolveImage (item: OFFPriceItem): string {
  return item.product?.image_url?.trim() || ''
}

function normalizeItem (item: OFFPriceItem): ProductRow | null {
  // Descartar items sin EAN o sin precio válido
  if (!item.product_code || item.price <= 0 || !item.price || item.currency !== 'EUR') return null

  return {
    ean: item.product_code,
    name: resolveName(item),
    brand: resolveBrand(item),
    category: resolveCategory(item),
    price: item.price,
    imageUrl: resolveImage(item),
    sourceId: item.product_code,  // EAN como source_id (no hay ID interno de producto)
  }
}

// ─── Paginación ───────────────────────────────────────────────────────────────

export async function fetchAllPrices (locationId: number): Promise<ProductRow[]> {
  // Primera llamada para saber el total
  const first = await fetchJson<OFFResponse>(
    `${BASE_URL}/prices?location_id=${locationId}&page=1&size=${PAGE_SIZE}`
  )
  if (!first) return []

  const totalPages = first.pages
  log(`Total registros: ${first.total} | Páginas: ${totalPages}`)

  const allItems: OFFPriceItem[] = [...first.items]

  // Resto de páginas
  for (let page = 2; page <= totalPages; page++) {
    log(`  Página ${page}/${totalPages}...`)
    const data = await fetchJson<OFFResponse>(
      `${BASE_URL}/prices?location_id=${locationId}&page=${page}&size=${PAGE_SIZE}`
    )
    if (data) allItems.push(...data.items)
    await sleep(PAGE_DELAY)
  }

  log(`Items crudos recibidos: ${allItems.length}`)

  // Normalizar y deduplicar por EAN (quedarse con el precio más reciente)
  const seen = new Map<string, ProductRow>()
  for (const item of allItems) {
    const row = normalizeItem(item)
    if (row && !seen.has(row.ean)) {
      seen.set(row.ean, row)
    }
  }

  log(`Productos únicos válidos: ${seen.size}`)
  return [...seen.values()]
}
