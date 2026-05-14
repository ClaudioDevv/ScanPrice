import { Router } from 'express'
import * as SuggestionController from '../controllers/suggestion.controller'
import { validateRequest } from '../middlewares/validateRequest'
import { requireApiKey } from '../middlewares/requireApiKey'
import { approveSchema, createSuggestionSchema } from '../validators/suggestion.validator'

const router = Router()

router.post('/', validateRequest(createSuggestionSchema), SuggestionController.create)
router.get('/', SuggestionController.getAll)

router.post('/:id/approve', requireApiKey, validateRequest(approveSchema), SuggestionController.approve)

export default router
