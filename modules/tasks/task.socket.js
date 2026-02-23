import appEmitter from '../../core/events/eventEmitter.js'
import { EVENTS } from '../../core/events/eventTypes.js'

export default function TaskSocket(io, socket) {
  console.log('Task socket connected:', socket.id)

  // Client-side events
  socket.on('task:update', data => socket.broadcast.emit('task:updated', data))
  socket.on('task:delete', id => socket.broadcast.emit('task:deleted', id))

  // Server-side emitted events → broadcast to clients
  appEmitter.on(EVENTS.TASK_CREATED, data => io.emit('task:created', data))
  appEmitter.on(EVENTS.TASK_UPDATED, data => io.emit('task:updated', data))
  appEmitter.on(EVENTS.TASK_DELETED, id => io.emit('task:deleted', id))
  appEmitter.on(EVENTS.TASK_ASSIGNED, data => io.emit('task:assigned', data))

  socket.on('disconnect', () => console.log('Task socket disconnected:', socket.id))
}
