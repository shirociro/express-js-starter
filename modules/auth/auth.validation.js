import { body } from 'express-validator'

export const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('firstname').trim().notEmpty(),
  body('lastname').trim().notEmpty(),
]
