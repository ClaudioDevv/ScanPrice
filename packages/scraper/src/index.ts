import { pool } from './db/pg'
import { log } from './utils/utils'
// import { runMercadonaScraper } from './services/mercadona.service'
import { runOpenPriceApi } from './services/open-price-api.service'

async function main () {
  // try {
  //   await runMercadonaScraper()
  // } catch (err) {
  //   log(`Mercadona falló: ${err}`)
  // }
  try {
    await runOpenPriceApi()
  } catch (err) {
    log(`OpenPrice falló: ${err}`)
  }
}

main()
  .catch((err) => log(`Error fatal: ${err}`))
  .finally(() => pool.end())
