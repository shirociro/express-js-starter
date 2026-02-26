import express from 'express'
import { verifyToken } from '../../shared/middleware/verifyToken.js'
import { taskController } from './task.index.js' // Use container, not controller directly

const router = express.Router()

router.get('/', taskController.getTasks)
router.post('/', taskController.createTask)
router.patch('/:id', taskController.patchTask)
router.patch('/test', (req, res) => {
  console.log('PATCH test hit!', req.body)
  res.json({ ok: true, data: req.body })
})
router.delete('/:id', taskController.deleteTask)

export default router
