import appEmitter from '../../core/events/eventEmitter.js'
import { EVENTS } from '../../core/events/eventTypes.js'

export default function registerUserEvents() {
  appEmitter.on(EVENTS.USER_CREATED, user => {
    console.log('[EVENT] USER_CREATED:', user)
  })

  appEmitter.on(EVENTS.USER_UPDATED, user => {
    console.log('[EVENT] USER_UPDATED:', user)
  })

  appEmitter.on(EVENTS.USER_DELETED, userId => {
    console.log('[EVENT] USER_DELETED:', userId)
  })
}
