import express from 'express'
import { authController } from './auth.index.js' // Use container, not controller directly
import { apiLimiter } from '../../common/middleware/rateLimiter.js'
import { registerValidation } from './auth.validation.js'
import { validate } from '../../common/middleware/validationHandler.js'

const router = express.Router()

router.post('/login', apiLimiter, authController.login)

router.post('/register', apiLimiter, registerValidation, validate, authController.register)

// router.post('/refresh-token', apiLimiter, authController.refreshToken)

export default router
