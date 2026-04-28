import { Router } from 'express'
import * as ProductController from '../controllers/product.controller'
import { validateRequest } from '../middlewares/validateRequest'
import { getProductSchema } from '../validators/product.validator'

const router = Router()

router.get('/:ean', validateRequest(getProductSchema), ProductController.getByEan)

router.get('/:ean/alternatives', validateRequest(getProductSchema), ProductController.getAlternatives)

export default router
