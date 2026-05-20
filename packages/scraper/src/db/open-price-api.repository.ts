import { SUPERMARKET_NAME } from '../scrapers/open-price-api'
import { ProductRow } from '../types/open-price-api'
import { pool } from './pg'

const UPSERT_SQL = `
  INSERT INTO products (
    ean, name, category, brand, supermarket,
    price, image_url, source_id, created_at, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
  ON CONFLICT (ean, supermarket)
  DO UPDATE SET
    name       = EXCLUDED.name,
    price      = EXCLUDED.price,
    image_url  = COALESCE(NULLIF(EXCLUDED.image_url, ''), products.image_url),
    category   = COALESCE(NULLIF(EXCLUDED.category, ''), products.category),
    brand      = COALESCE(NULLIF(EXCLUDED.brand, ''), products.brand),
    updated_at = NOW()
`

export async function upsertProducts (products: ProductRow[]): Promise<number> {
  if (!products.length) return 0

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const p of products) {
      await client.query(UPSERT_SQL, [
        p.ean,
        p.name,
        p.category,
        p.brand,
        SUPERMARKET_NAME,
        p.price,
        p.imageUrl,
        p.sourceId,
      ])
    }
    await client.query('COMMIT')
    return products.length
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
