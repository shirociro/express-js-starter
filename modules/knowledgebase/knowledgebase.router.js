import express from 'express'
import { verifyToken } from '../../common/middleware/verifyToken.js'
import { knowledgebaseController } from './knowledgebase.index.js' // Use container, not controller directly

const router = express.Router()

router.get('/', knowledgebaseController.getKnowledgebase)
router.post('/', knowledgebaseController.createKnowledgebase)
router.patch('/:id', knowledgebaseController.patchKnowledgebase)
router.delete('/:id', knowledgebaseController.deleteKnowledgebase)

export default router
