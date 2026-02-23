export function createUserService({ userModel, emitter, events }) {
  return {
    async getUsers(params) {
      return userModel.getUsers(params)
    },
    async patchUser(id, updates, file, removeProfile = false) {
      if (!id || !updates || Object.keys(updates).length === 0) {
        return null
      }

      // Call model to perform the dynamic update
      const updatedUser = await userModel.patchUser(id, updates, file, removeProfile)
      if (updatedUser) {
        // emitter.emit(events.USER_UPDATED, updatedUser)
      }
      return updatedUser
    },
    async createUser(userData, file) {
      if (!userData || Object.keys(userData).length === 0) {
        throw new Error('No user data provided')
      }

      const createdUser = await userModel.createUser(userData, file)

      if (createdUser) {
        // Optionally emit an event
        // emitter.emit(events.USER_CREATED, createdUser)
      }

      return createdUser
    },
    async deleteUser(id) {
      const deletedUser = await userModel.deleteUser(id)
      if (deletedUser) {
        // emitter.emit(events.USER_DELETED, deletedUser)
      }
      return deletedUser
    },

  }
}
