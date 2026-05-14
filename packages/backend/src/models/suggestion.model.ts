import { PoolClient } from 'pg'
import { pool } from '../config/pg'
import { HttpStatus } from '../constants/httpStatus'
import { SuggestionInput, Suggestion } from '../types/suggestion'
import { AppError } from '../utils/AppError'

export const create = async (data: SuggestionInput): Promise<Suggestion> => {
  let result
  try {
    const { ean, name, category, brand, supermarket, price } = data

    result = await pool.query('INSERT INTO product_suggestions(ean, name, category, brand, supermarket, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [ean, name, category, brand, supermarket, price])
  } catch (error) {
    console.error(`Error al insertar product_suggesion ${error}`)
    throw new AppError('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR)
  }

  if (!result.rows[0]) {
    console.error('Error al recuperar el registro creado')
    throw new AppError('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR)
  }

  return result.rows[0]
}

export const getAll = async (): Promise<Suggestion[]> => {
  try {
    const result = await pool.query('SELECT * FROM product_suggestions')

    return result.rows
  } catch (error) {
    console.error(`Error al obtener product_suggesion ${error}`)
    throw new AppError('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

export const getById = async ({ id, client }: { id: number, client: PoolClient }): Promise<SuggestionInput | null> => {
  try {
    const result = await client.query('SELECT ean, name, category, brand, supermarket, price FROM product_suggestions WHERE id = $1', [id])
    const suggestion: SuggestionInput = result.rows[0]

    if (!suggestion) return null

    return suggestion
  } catch (error) {
    console.error(`Error al obtener sugerencia ${error}`)
    throw new AppError('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

export const removeById = async ({ id, client }: { id: number, client: PoolClient }): Promise<Suggestion | null> => {
  try {
    const result = await client.query('DELETE FROM product_suggestions WHERE id = $1 RETURNING *', [id])
    const eliminatedSuggestion: Suggestion = result.rows[0]

    if (!eliminatedSuggestion) return null

    return eliminatedSuggestion
  } catch (error) {
    console.error(`Error al eliminar sugerencia ${error}`)
    throw new AppError('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
