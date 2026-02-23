import { Server } from 'socket.io'
import appEmitter from '../events/eventEmitter.js'
import { EVENTS } from '../events/eventTypes.js'

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*' },
  })

  appEmitter.on(EVENTS.USER_CREATED, user => {
    io.emit('user:created', user)
  })
  appEmitter.on(EVENTS.USER_UPDATED, user => {
    io.emit('user:updated', user)
  })

  appEmitter.on(EVENTS.TASK_ADDED, task => {
    io.emit('task:added', task)
  })

  io.on('connection', socket => {
    console.log('Client connected:', socket.id)
  })

  return io // <-- THIS INSTANCE WILL BE USED BY SERVER.JS
}
