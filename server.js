import config from './config/jwt.js'
import { createApp } from './app.js'
import http from 'http'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { initSocket } from './core/sockets/socket.js'
import { apiLimiter } from './common/middleware/rateLimiter.js'

const PORT = config.port
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

;(async () => {
  const app = await createApp()

  // app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
  app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      res.setHeader('Cache-Control', 'no-store')
    },
  })
)
  app.use(apiLimiter)

  const server = http.createServer(app)

  // 4️⃣ Initialize Socket.IO
  const io = initSocket(server)
  app.set('io', io)

  // 5️⃣ Start server
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`)
    console.log(`Socket.IO running on port ${PORT}`)
  })
})()
