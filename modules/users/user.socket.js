import appEmitter from '../../core/events/eventEmitter.js'

export default function userSocket(io, socket) {
  console.log('User socket connected:', socket.id)

  // Client emits user:update
  socket.on('user:update', user => {
    socket.broadcast.emit('user:updated', user) // send to other clients
  })

  // Client emits user:delete
  socket.on('user:delete', userId => {
    socket.broadcast.emit('user:deleted', userId)
  })

  // Optional: backend emitter events
  appEmitter.on('USER_UPDATED', user => {
    io.emit('user:updated', user)
  })

  appEmitter.on('USER_DELETED', userId => {
    io.emit('user:deleted', userId)
  })

  socket.on('disconnect', () => {
    console.log('User socket disconnected:', socket.id)
  })
}
