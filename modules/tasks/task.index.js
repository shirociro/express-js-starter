import { createTaskModel } from './task.model.js'
import { createTaskService } from './task.service.js'
import { createTaskController } from './task.controller.js'
import { success, error } from '../../shared/utils/response.js'
import { EVENTS } from '../../core/events/eventTypes.js'
import appEmitter from '../../core/events/eventEmitter.js'
const taskModel = createTaskModel()

const taskService = createTaskService({ taskModel, appEmitter, EVENTS })

export const taskController = createTaskController(taskService, { success, error })
