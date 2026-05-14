import * as SuggestionModel from '../models/suggestion.model'
import * as ProductModel from '../models/product.model'
import { AppError } from '../utils/AppError'
import { HttpStatus } from '../constants/httpStatus'
import { pool } from '../config/pg'

export const approve = async ({ id }: { id: number }): Promise<void> => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const suggestion = await SuggestionModel.getById({ id, client })
    if (!suggestion) throw new AppError('Sugerencia no encontrada', HttpStatus.NOT_FOUND)

    await ProductModel.createProductSuggestion({ suggestion, client })

    const eliminatedSuggestion = await SuggestionModel.removeById({ id, client })
    if (!eliminatedSuggestion) throw new AppError('Error al eliminar sugerencia', HttpStatus.INTERNAL_SERVER_ERROR)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    if (error instanceof AppError) throw error
    throw new AppError('Error al aprobar sugerencia', HttpStatus.INTERNAL_SERVER_ERROR)
  } finally {
    client.release()
  }
}
