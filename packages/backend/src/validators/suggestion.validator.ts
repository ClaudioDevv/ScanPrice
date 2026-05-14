import { z } from 'zod'

export const createSuggestionSchema = z.object({
  body: z.object({
    ean: z.string().min(8).max(14).regex(/^\d+$/, 'Código ean inválido'),
    name: z.string().min(1).max(100, 'Máximo 100 carácteres'),
    category: z.string().max(100, 'Máximo 100 carácteres').optional(),
    brand: z.string().max(100, 'Máximo 100 carácteres').optional(),
    supermarket: z.string().min(1).max(100, 'Máximo 100 carácteres'),
    price: z.number().positive('El precio debe ser mayor que 0')
  })
})

export const approveSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser un número')
  })
})

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>['body']
