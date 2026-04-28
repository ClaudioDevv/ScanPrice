import { HttpStatus } from '../constants/httpStatus'
import { pool } from '../config/pg'
import { AppError } from '../utils/AppError'
import { Product } from '../types/product'

export const getByEan = async ({ ean, supermarket }: { ean: string, supermarket: string }): Promise<Product | null> => {
  try {
    const result = await pool.query('SELECT id, name, category, brand, supermarket, price, normalized_name_id, image_url FROM products WHERE ean = $1 AND supermarket = $2', [ean, supermarket])
    const product: Product = result.rows[0]

    if (!product) {
      return null
    }

    return product
  } catch (error) {
    console.error(`Error en la BD: ${error}`)
    throw new AppError('Error al obtener el producto', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

export const getAlternatives = async ({ ean, supermarket }: { ean: string, supermarket: string }): Promise<Product[]> => {
  try {
    const result = await pool.query(`
      SELECT p2.id, p2.name, p2.category, p2.brand, p2.supermarket, p2.price, p2.image_url 
      FROM products p1
      JOIN products p2 ON p1.normalized_name_id = p2.normalized_name_id
      WHERE p1.ean = $1 
      AND p2.supermarket != $2`
    , [ean, supermarket])

    return result.rows
  } catch (error) {
    console.error(`Error en la BD: ${error}`)
    throw new AppError('Error al obtener alternativas', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
