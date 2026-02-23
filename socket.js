import { Server } from 'socket.io'

export function initSocket(server, app) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://192.168.1.3:5173'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  })

  app.set('io', io)

  io.on('connection', socket => {
    console.log('Client connected:', socket.id)
  })

  return io
}
