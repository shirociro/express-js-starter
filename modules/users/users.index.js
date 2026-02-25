import { createUserModel } from './user.model.js'
const userModel = createUserModel()

import { createUserService } from './user.service.js'
import { createUserController } from './user.controller.js'
import { success, error } from '../../shared/utils/response.js'
import { EVENTS } from '../../core/events/eventTypes.js'
import appEmitter from '../../core/events/eventEmitter.js'
// import userModel from './user.repository.js'

const userService = createUserService({ userModel, appEmitter, EVENTS })

export const userController = createUserController(userService, { success, error })
