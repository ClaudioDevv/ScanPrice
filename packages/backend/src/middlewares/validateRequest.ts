import { Request, Response, NextFunction } from 'express'
import { ZodError, ZodType } from 'zod'
import { HttpStatus } from '../constants/httpStatus'

export const validateRequest = (schema: ZodType) => {
  return async (req: Request, res:Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        })
      }
      next(error)
    }
  }
}
