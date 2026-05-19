import { getAllSubcategoryIds, getProductDetail, getProductsFromSubcat, log, runWithConcurrency, sleep } from '../scrapers/mercadona.scraper'
import { loadKnownSourceIds, upsertProducts } from '../db/mercadona.repository'
import { ProductBasic, ProductDetail } from '../types/mercadona.types'

const CONCURRENCY = 8    // peticiones simultáneas a /api/products/{id}
const BATCH_DELAY = 150  // ms entre lotes
const BATCH_SIZE = 50    // productos por lote

export async function runMercadonaScraper (): Promise<void> {
  log('=== Mercadona Scraper iniciado ===')
  const start = Date.now()

  const knownIds = await loadKnownSourceIds()
  log(`Productos ya en BD: ${knownIds.size}`)

  // ── Paso 1: subcategorías ──────────────────────────────────────────────────
  const subcats = await getAllSubcategoryIds()

  // ── Paso 2: product IDs y precios ─────────────────────────────────────────
  const allProductsMap = new Map<string, ProductBasic>()

  for (let i = 0; i < subcats.length; i++) {
    const subcat = subcats[i]

    let products
    if (subcat) {
      log(`[${i + 1}/${subcats.length}] ${subcat.superName} → ${subcat.subName}`)
      products = await getProductsFromSubcat(subcat)
    }
    for (const p of products ?? []) {
      allProductsMap.set(p.productId, p) // deduplicar
    }
    await sleep(50)
  }

  log(`Productos únicos encontrados: ${allProductsMap.size}`)

  // ── Paso 3: EAN para productos nuevos ─────────────────────────────────────
  const newProducts = [...allProductsMap.values()].filter(
    (p) => !knownIds.has(p.productId)
  ).slice(0, 20) // PRUEBA 20 PRODUCTS
  log(`Productos nuevos (necesitan EAN): ${newProducts.length}`)

  let totalInserted = 0

  for (let i = 0; i < newProducts.length; i += BATCH_SIZE) {
    const batch = newProducts.slice(i, i + BATCH_SIZE)

    const tasks = batch.map((p) => () => getProductDetail(p))
    const results = await runWithConcurrency(tasks, CONCURRENCY)
    const detailed = results.filter((r): r is ProductDetail => r !== null)

    const inserted = await upsertProducts(detailed)
    totalInserted += inserted

    log(
      `  Lote ${Math.floor(i / BATCH_SIZE) + 1}: ` +
      `${detailed.length} detallados, ${inserted} insertados/actualizados`
    )
    await sleep(BATCH_DELAY)
  }

  // ── Paso 4: actualizar precios de productos existentes ────────────────────
  const existingProducts = [...allProductsMap.values()].filter((p) =>
    knownIds.has(p.productId)
  )
  log(`Actualizando precios de ${existingProducts.length} productos existentes...`)

  const existingDetailed: ProductDetail[] = existingProducts.map((p) => ({
    ...p,
    ean: knownIds.get(String(p.productId)) ?? '',
    brand: '',
  }))

  const updated = await upsertProducts(existingDetailed)
  log(`Precios actualizados: ${updated}`)

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  log(`=== Completado en ${elapsed}s | Nuevos: ${totalInserted} | Actualizados: ${updated} ===`)
}
