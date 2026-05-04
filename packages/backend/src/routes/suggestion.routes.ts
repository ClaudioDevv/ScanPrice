import { Router } from 'express'
import * as SuggestionController from '../controllers/suggestion.controller'
import { validateRequest } from '../middlewares/validateRequest'
import { createSuggestionSchema } from '../validators/suggestion.validator'

const router = Router()

router.post('/', validateRequest(createSuggestionSchema), SuggestionController.create)
router.get('/', SuggestionController.getAll)

export default router
