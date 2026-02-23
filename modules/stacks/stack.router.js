import express from 'express'
import { verifyToken } from '../../common/middleware/verifyToken.js'
import { stackController } from './stacks.index.js'
import { uploadLogo } from '../../config/multer.js'

const router = express.Router()

router.get('/', stackController.getStacks)
router.patch('/:id', uploadLogo.single('logo'), stackController.patchStack)
router.delete('/:id', stackController.deleteStack)
router.post('/', uploadLogo.single('logo'), stackController.createStack)

export default router
