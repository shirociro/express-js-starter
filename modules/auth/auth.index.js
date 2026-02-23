import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// import * as authModel from './auth.model.js'
import authModel from './auth.repository.js'

import { createAuthService } from './auth.service.js'
import { createAuthController } from './auth.controller.js'
import { success, error } from '../../common/utils/response.js'

// 1️⃣ Service DI
const authService = createAuthService({
  bcrypt,
  jwt,
  authModel,
  config: {
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    ACCESS_EXPIRES_IN: '12h',
    REFRESH_EXPIRES_IN: '14d',
    REFRESH_DB_EXPIRES_MS: 60 * 60 * 1000,
  },
})

// 2️⃣ Controller DI
export const authController = createAuthController(authService, { success, error })
