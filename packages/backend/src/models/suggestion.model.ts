import { pool } from '../config/pg'
import { HttpStatus } from '../constants/httpStatus'
import { CreateSuggestionInput, Suggestion } from '../types/suggestion'
import { AppError } from '../utils/AppError'

export const create = async (data: CreateSuggestionInput): Promise<Suggestion> => {
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
