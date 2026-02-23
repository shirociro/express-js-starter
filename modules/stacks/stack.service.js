export function createStackService({ stackModel, emitter, events }) {
  return {
    async getStacks(params) {
      return stackModel.getStacks(params)
    },
    async patchStack(id, updates, file, removeLogo = false) {
      if (!id || !updates || Object.keys(updates).length === 0) {
        return null
      }

      // Call model to perform the dynamic update
      const updatedStack = await stackModel.patchStack(id, updates, file, removeLogo)
      if (updatedStack) {
        // emitter.emit(events.USER_UPDATED, updatedUser)
      }
      return updatedStack
    },
    async deleteStack(id) {
      const deletedStack = await stackModel.deleteStack(id)
      if (deletedStack) {
        // emitter.emit(events.USER_DELETED, deletedUser)
      }
      return deletedStack
    },
    async createUser(stackData) {
      if (!stackData || Object.keys(stackData).length === 0) {
        throw new Error('No stack data provided')
      }

      const createdStack = await stacckModel.createUser(stackData)

      if (createdStack) {
        // Optionally emit an event
        // emitter.emit(events.USER_CREATED, createdUser)
      }

      return createdStack
    },
  }
}
