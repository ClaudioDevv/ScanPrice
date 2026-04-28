import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({ success: false, error: err.message })
    return
  }

  // Error inesperado - no exponer detalles
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
}
