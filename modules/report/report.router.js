import express from 'express'
import { reportController } from './report.index.js'

const router = express.Router()

router.get('/tasks/pdf', reportController.taskPdf)
router.get('/tasks/excel', reportController.taskExcel)

export default router
