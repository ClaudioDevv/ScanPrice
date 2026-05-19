import { pool } from './db/pg'
import { log } from './scrapers/mercadona.scraper'
import { runMercadonaScraper } from './services/mercadona.service'
// import { runOpenFoodFactsScraper } from './services/openfoodfacts.service'

async function main () {
  try {
    await runMercadonaScraper()
  } catch (err) {
    log(`Mercadona falló: ${err}`)
  }
  try {
    // await runOpenFoodFactsScraper()
  } catch (err) {
    log('OpenFoodFacts falló, continuando...')
  }
}

main()
  .catch((err) => log(`Error fatal: ${err}`))
  .finally(() => pool.end())
