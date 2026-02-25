import express from 'express'
import { getHealth } from './health.controller.js'
import { apiLimiter } from '../../shared/middleware/rateLimiter.js'

const router = express.Router()

router.get('/', apiLimiter, getHealth)

export default router
