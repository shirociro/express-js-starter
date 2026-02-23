import { createStackModel } from './stack.model.js'
const stackModel = createStackModel()

import { createStackService } from './stack.service.js'
import { createStackController } from './stack.controller.js'
import { success, error } from '../../common/utils/response.js'
import { EVENTS } from '../../core/events/eventTypes.js'
import appEmitter from '../../core/events/eventEmitter.js'
// import StackModel from './stack.repository.js'

const stackService = createStackService({ stackModel, appEmitter, EVENTS })

export const stackController = createStackController(stackService, { success, error })
