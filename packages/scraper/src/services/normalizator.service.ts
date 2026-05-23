import { pool } from '../db/pg'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { log, sleep } from '../utils/utils'
import { PoolClient } from 'pg'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const MAX_BATCHES = 20
const BATCH_SIZE = 200
const DELAY_MS = 2000

function buildPrompt (names: string[]): string {
  const numbered = names.map((n, i) => `${i + 1}. ${n}`).join('\n')
  return `Eres un normalizador de productos de supermercado español.
    Para cada producto devuelve SOLO su categoría genérica en 2-4 palabras en español,
    sin marca, sin gramaje, sin unidades, sin adjetivos de calidad.
    Sé consistente: productos equivalentes deben tener exactamente el mismo resultado.

    Ejemplos:
    "Pechuga de pollo Hacendado 500g" → "pechuga de pollo"
    "Leche entera Asturiana 1L" → "leche entera"
    "Detergente Ariel Pods 30u" → "detergente en cápsulas"
    "Agua mineral Fonter 1.5L" → "agua mineral"
    "Filete de pechuga pollo Dia 450g" → "pechuga de pollo"

    Devuelve ÚNICAMENTE un JSON array con exactamente ${names.length} strings, en el mismo orden.
    Sin explicaciones, sin markdown, sin texto adicional.

    Productos:
    ${numbered}`
}

async function callLLM (names: string[]): Promise<string[]> {
  const prompt = buildPrompt(names)
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)

  if (!Array.isArray(parsed) || parsed.length !== names.length) {
    throw new Error(`Expected ${names.length} items, got ${parsed.length}`)
  }

  return parsed.map((s: unknown) => {
    if (typeof s !== 'string') throw new Error(`Item no es string: ${s}`)
    return s.toLowerCase().trim()
  })
}

async function getOrCreateNormalizedName (
  client: PoolClient,
  name: string
): Promise<number> {
  // Intenta insertar, si ya existe lo ignora
  await client.query(
    'INSERT INTO normalized_names (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
    [name]
  )
  const res = await client.query<{ id: number }>(
    'SELECT id FROM normalized_names WHERE name = $1',
    [name]
  )

  const row = res.rows[0]
  if (!row) {
    throw new Error(`No se pudo obtener el id de normalized_name: ${name}`)
  }

  return row.id
}

async function processBatch (
  ids: number[],
  names: string[],
  batchNumber: number,
  total: number
): Promise<{ updated: number; errors: number }> {
  log(`Lote ${batchNumber} (${ids.length} productos)...`)

  let normalizedNames: string[]
  try {
    normalizedNames = await callLLM(names)
  } catch (err) {
    log(`  LLM falló en lote ${batchNumber}: ${err}`)
    return { updated: 0, errors: ids.length }
  }

  const client = await pool.connect()
  let updated = 0
  let errors = 0

  try {
    await client.query('BEGIN')

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const normalizedName = normalizedNames[i]

      if (!id || !normalizedName) {
        errors++
        continue
      }

      try {
        const normalizedId = await getOrCreateNormalizedName(client, normalizedName)
        await client.query(
          'UPDATE products SET normalized_name_id = $1 WHERE id = $2',
          [normalizedId, id]
        )
        updated++
      } catch (err) {
        log(`  Error en producto ${id}: ${err}`)
        errors++
      }
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  log(`  Lote ${batchNumber}: ${updated} actualizados, ${errors} errores`)
  return { updated, errors }
}

async function main () {
  log('=== Normalización iniciada ===')
  const start = Date.now()

  const res = await pool.query<{ id: number; name: string }>(
    'SELECT id, name FROM products WHERE normalized_name_id IS NULL ORDER BY id'
  )

  const products = res.rows
  log(`Productos sin normalizar: ${products.length}`)

  if (products.length === 0) {
    log('Nada que normalizar.')
    await pool.end()
    return
  }

  let totalUpdated = 0
  let totalErrors = 0
  const batches = Math.ceil(products.length / BATCH_SIZE)
  const batchesToProcess = Math.min(BATCH_SIZE * MAX_BATCHES, products.length)

  for (let i = 0; i < batchesToProcess; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    const ids = batch.map((p) => p.id)
    const names = batch.map((p) => p.name)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1

    const { updated, errors } = await processBatch(ids, names, batchNumber, batches)
    totalUpdated += updated
    totalErrors += errors

    if (i + BATCH_SIZE < products.length) {
      await sleep(DELAY_MS)
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  log(`=== Completado en ${elapsed}s | Actualizados: ${totalUpdated} | Errores: ${totalErrors} ===`)

  await pool.end()
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
