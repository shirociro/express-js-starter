import express from 'express'
import { verifyToken } from '../../shared/middleware/verifyToken.js'
import * as ctrl from '../users/user.controller.js'

const router = express.Router()

// router.get('/', verifyToken, ctrl.getMetaData)

export default router
