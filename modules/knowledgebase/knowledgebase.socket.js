import appEmitter from '../../core/events/eventEmitter.js'
import { EVENTS } from '../../core/events/eventTypes.js'

export default function KnowledgebaseSocket(io, socket) {
  console.log('Knowledgebase socket connected:', socket.id)

  // Client-side events
  socket.on('knowledgebase:update', data => socket.broadcast.emit('knowledgebase:updated', data))
  socket.on('knowledgebase:delete', id => socket.broadcast.emit('knowledgebase:deleted', id))

  // Server-side emitted events → broadcast to clients
  appEmitter.on(EVENTS.KNOWLEDGEBASE_CREATED, data => io.emit('knowledgebase:created', data))
  appEmitter.on(EVENTS.KNOWLEDGEBASE_UPDATED, data => io.emit('knowledgebase:updated', data))
  appEmitter.on(EVENTS.KNOWLEDGEBASE_DELETED, id => io.emit('knowledgebase:deleted', id))

  socket.on('disconnect', () => console.log('Knowledgebase socket disconnected:', socket.id))
}
