import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import path from 'path'
import { DiaCsvRow, DiaProduct } from '../types/dia.types'

const CSV_PATH = path.join(__dirname, '../../data/dia_products.csv')

export async function parseDiaCsv (): Promise<DiaProduct[]> {
  return new Promise((resolve, reject) => {
    const products: DiaProduct[] = []

    createReadStream(CSV_PATH)
      .pipe(parse({
        columns: true,        // usa la primera fila como cabeceras
        skip_empty_lines: true,
        trim: true,
      }))
      .on('data', (row: DiaCsvRow) => {
        const price = parseFloat(row.price)
        if (!row.product_id || isNaN(price)) return  // descarta filas inválidas

        products.push({
          sourceId: row.product_id,
          name: row.product_name,
          category: row.subgroup || '',
          brand: row.brand || '',
          price,
        })
      })
      .on('end', () => resolve(products))
      .on('error', reject)
  })
}
