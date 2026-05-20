import { upsertProducts } from '../db/open-price-api.repository'
import { fetchAllPrices, LOCATION_ID, SUPERMARKET_NAME } from '../scrapers/open-price-api'
import { log } from '../utils/utils'

export async function runOpenPriceApi () {
  log(`=== Open Prices Scraper - ${SUPERMARKET_NAME} ===`)
  const start = Date.now()

  const products = await fetchAllPrices(LOCATION_ID)

  if (!products.length) {
    log('No se encontraron productos válidos.')
    return
  }

  const inserted = await upsertProducts(products)

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  log(`=== Completado en ${elapsed}s | Insertados/actualizados: ${inserted} ===`)
}
