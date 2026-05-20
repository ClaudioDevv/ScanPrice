import { pool } from './pg'
import { log } from '../utils/utils'
import { ProductDetail } from '../types/mercadona.types'

const UPSERT_SQL = `
  INSERT INTO products (
    ean, name, category, brand, supermarket,
    price, image_url, source_id, created_at, updated_at
  )
  VALUES ($1, $2, $3, $4, 'Mercadona', $5, $6, $7, NOW(), NOW())
  ON CONFLICT (ean, supermarket)
  DO UPDATE SET
    name       = EXCLUDED.name,
    price      = EXCLUDED.price,
    image_url  = EXCLUDED.image_url,
    category   = EXCLUDED.category,
    brand      = EXCLUDED.brand,
    updated_at = NOW()
`

export async function upsertProducts (products: ProductDetail[]): Promise<number> {
  const valid = products.filter((p) => p.ean)
  const skipped = products.length - valid.length
  if (skipped > 0) log(`Descartados ${skipped} productos sin EAN`)
  if (!valid.length) return 0

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const p of valid) {
      await client.query(UPSERT_SQL, [
        p.ean,
        p.name,
        p.category,
        p.brand,
        p.price,
        p.imageUrl,
        p.productId,
      ])
    }
    await client.query('COMMIT')
    return valid.length
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function loadKnownSourceIds (): Promise<Map<string, string>> {
  const res = await pool.query<{ source_id: string; ean: string }>(
    "SELECT source_id, ean FROM products WHERE supermarket = 'Mercadona'"
  )
  return new Map(res.rows.map((r) => [String(r.source_id), r.ean]))
}
