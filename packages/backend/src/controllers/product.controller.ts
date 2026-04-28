import * as ProductModel from '../models/product.model'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { HttpStatus } from '../constants/httpStatus'

export const getByEan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ean = req.params.ean as string
    const supermarket = req.query.supermarket as string

    const product = await ProductModel.getByEan({ ean, supermarket })

    if (!product) {
      throw new AppError('Producto no existe', HttpStatus.NOT_FOUND)
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    next(error)
  }
}

export const getAlternatives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ean = req.params.ean as string
    const supermarket = req.query.supermarket as string

    const products = await ProductModel.getAlternatives({ ean, supermarket })

    res.json({
      success: true,
      data: products
    })
  } catch (error) {
    next(error)
  }
}
