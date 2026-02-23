import express from 'express'
import { sendContact } from './email.controller.js'

const router = express.Router()

router.post('/send-email', sendContact)

export default router
