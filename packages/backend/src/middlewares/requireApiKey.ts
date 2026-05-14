import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { HttpStatus } from '../constants/httpStatus'

export const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const key = req.header('x-admin-key')

    if (!key) throw new AppError('No autorizado', HttpStatus.UNAUTHORIZED)

    if (key !== process.env.API_KEY) throw new AppError('No autorizado', HttpStatus.UNAUTHORIZED)

    next()
  } catch (error) {
    next(error)
  }
}
