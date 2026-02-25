import express from 'express'
import { verifyToken } from '../../shared/middleware/verifyToken.js'
import { userController } from './users.index.js' 
import { uploadProfile } from '../../config/multer.js'

const router = express.Router()

router.get('/', userController.getUsers)
router.patch('/:id', uploadProfile.single('profile'), userController.patchUser)
router.delete('/:id', userController.deleteUser)
router.post('/', uploadProfile.single('image'), userController.createUser)

export default router
