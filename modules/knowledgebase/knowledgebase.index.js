import { createKnowledgebaseModel } from './knowledgebase.model.js'
import { createKnowledgebaseService } from './knowledgebase.service.js'
import { createKnowledgebaseController } from './knowledgebase.controller.js'
import { success, error } from '../../common/utils/response.js'
import { EVENTS } from '../../core/events/eventTypes.js'
import appEmitter from '../../core/events/eventEmitter.js'
const knowledgebaseModel = createKnowledgebaseModel()

const knowledgebaseService = createKnowledgebaseService({ knowledgebaseModel, appEmitter, EVENTS })

export const knowledgebaseController = createKnowledgebaseController(knowledgebaseService, {
  success,
  error,
})
