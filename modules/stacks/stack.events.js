import appEmitter from '../../core/events/eventEmitter.js'

import { EVENTS } from '../../core/events/eventTypes.js'

export default function registerStackEvents() {
  appEmitter.on(EVENTS.STACK_CREATED, stack => {
    console.log('[EVENT] STACK_CREATED:', stack)
  })
}
