import appEmitter from '../../core/events/eventEmitter.js'

export default function stackSocket(io, socket) {
  console.log('Stack socket connected:', socket.id)

  socket.on('stack:update', stack => {
    socket.broadcast.emit('stack:updated', stack) // send to other clients
  })

  // Client emits stack:delete
  socket.on('stack:delete', stackId => {
    socket.broadcast.emit('stack:deleted', stackId)
  })

  // Optional: backend emitter events
  appEmitter.on('STACK_UPDATED', stack => {
    io.emit('stack:updated', stack)
  })

  appEmitter.on('STACK_DELETED', stackId => {
    io.emit('stack:deleted', stackId)
  })

  socket.on('disconnect', () => {
    console.log('Stack socket disconnected:', socket.id)
  })
}
