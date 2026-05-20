import { parseDiaCsv } from '../scrapers/dia.scraper'
import { upsertDiaProducts } from '../db/dia.repository'
import { log } from '../utils/utils'

export async function runDiaScraper () {
  log('=== Dia CSV Scraper ===')
  const start = Date.now()

  const products = await parseDiaCsv()
  log(`Productos leídos del CSV: ${products.length}`)

  if (!products.length) {
    log('CSV vacío o inválido.')
    return
  }

  const inserted = await upsertDiaProducts(products)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  log(`=== Completado en ${elapsed}s | Insertados/actualizados: ${inserted} ===`)
}
