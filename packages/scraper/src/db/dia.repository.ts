import { pool } from './pg'
import { DiaProduct } from '../types/dia.types'

const UPSERT_SQL = `
  INSERT INTO products (
    ean, name, category, brand, supermarket,
    price, image_url, source_id, created_at, updated_at
  )
  VALUES ($1, $2, $3, $4, 'dia', $5, '', $6, NOW(), NOW())
  ON CONFLICT (ean, supermarket)
  DO UPDATE SET
    price      = EXCLUDED.price,
    category   = COALESCE(NULLIF(EXCLUDED.category, ''), products.category),
    brand      = COALESCE(NULLIF(EXCLUDED.brand, ''), products.brand),
    updated_at = NOW()
`

export async function upsertDiaProducts (products: DiaProduct[]): Promise<number> {
  if (!products.length) return 0

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const p of products) {
      await client.query(UPSERT_SQL, [
        `DIA-${p.sourceId}`,  // EAN sintético para no violar el NOT NULL
        p.name,
        p.category,
        p.brand,
        p.price,
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
