import appEmitter from './eventEmitter.js'

test('eventEmitter should emit and listen', done => {
  appEmitter.once('user-created', data => {
    expect(data.username).toBe('ciro')
    done()
  })

  appEmitter.emit('user-created', { username: 'ciro' })
})
