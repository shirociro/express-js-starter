import appEmitter from '../../core/events/eventEmitter.js'
import { EVENTS } from '../../core/events/eventTypes.js'

export default function registerKnowledgebaseEvents() {
  appEmitter.on(EVENTS.KNOWLEDGEBASE_CREATED, kb => console.log('[EVENT] CREATED:', kb))
  appEmitter.on(EVENTS.KNOWLEDGEBASE_UPDATED, kb => console.log('[EVENT] UPDATED:', kb))
  appEmitter.on(EVENTS.KNOWLEDGEBASE_DELETED, id => console.log('[EVENT] DELETED:', id))
}
