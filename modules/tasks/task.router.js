import express from 'express'
import { verifyToken } from '../../common/middleware/verifyToken.js'
import { taskController } from './task.index.js' // Use container, not controller directly

const router = express.Router()

router.get('/', taskController.getTasks)
router.post('/', taskController.createTask)
// router.patch('/:id', taskController.patchTask)
// router.patch('/:id', (req, res) => {
//   console.log('Direct test PATCH hit')
//   console.log('Route param id:', req.params.id)
//   console.log('Body:', req.body)

//   res.json({
//     ok: true,
//     status: 200,
//     message: 'Direct test PATCH successful',
//     data: {
//       id: req.params.id,
//       ...req.body
//     }
//   })
// })
router.patch('/test', (req, res) => {
  console.log('PATCH test hit!', req.body)
  res.json({ ok: true, data: req.body })
})
router.delete('/:id', taskController.deleteTask)

export default router
