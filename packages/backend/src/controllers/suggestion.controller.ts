import { Request, Response, NextFunction } from 'express'
import * as SuggestionModel from '../models/suggestion.model'
import * as SuggestionService from '../services/suggestion.service'
import { HttpStatus } from '../constants/httpStatus'

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ean, name, category, brand, supermarket, price } = req.body

    const suggestion = await SuggestionModel.create({ ean, name, category, brand, supermarket, price })

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Sugerencia recibida correctamente',
      data: {
        id: suggestion.id
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suggestions = await SuggestionModel.getAll()

    res.status(HttpStatus.OK).json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    next(error)
  }
}

export const approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const numberId = Number(id)
    await SuggestionService.approve({ id: numberId })

    res.json({
      success: true,
      message: 'Sugerencia aprobada correctamente'
    })
  } catch (error) {
    next(error)
  }
}
