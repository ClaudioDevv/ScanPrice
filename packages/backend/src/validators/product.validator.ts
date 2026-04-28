import { z } from 'zod'

export const getProductSchema = z.object({
  query: z.object({
    supermarket: z.string().max(50).min(1)
  }),
  params: z.object({
    ean: z.string().min(8).max(14).regex(/^\d+$/, 'Código ean inválido')
  })
})

export type ProductInput = z.infer<typeof getProductSchema>
