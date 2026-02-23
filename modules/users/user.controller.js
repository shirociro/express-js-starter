export function createUserController(userService, { success, error }) {
  async function getUsers(req, res) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : null
      const search = req.query.search || ''
      const position = req.query.position ? parseInt(req.query.position, 10) : 0

      const rows = await userService.getUsers({ page, limit, search, position })
      res.json(rows)
    } catch (err) {
      return error(res, 'Error deleting user', [{ message: err.message }], 500)
    }
  }
  async function createUser(req, res) {
    try {
      const userData = req.body
      const file = req.file
      if (!userData || Object.keys(userData).length === 0) {
        return error(res, 'No user data provided', [], 400)
      }

      const createdUser = await userService.createUser(userData, file)

      return success(res, createdUser, 'User created successfully', 201)
    } catch (err) {
      return error(res, 'Error creating user', [{ message: err.message }], 500)
    }
  }

  async function patchUser(req, res) {
    try {
      const { id } = req.params
      const updates = req.body
      const file = req.file
      const removeProfile = updates.remove_profile

      if (!id) return error(res, 'User ID is required', [], 400)
      if (!updates && !file) return error(res, 'No data provided', [], 400)

      // Call service
      const result = await userService.patchUser(id, updates, file, removeProfile)

      if (!result) return error(res, 'User not found or update failed', [], 404)
      return success(res, result, 'User updated successfully', 200)
    } catch (err) {
      console.error(err)
      return error(res, 'Error updating user', [{ message: err.message }], 500)
    }
  }

  async function deleteUser(req, res) {
    try {
      const { id } = req.params
      if (!id) return error(res, 'User ID is required', [], 400)

      const result = await userService.deleteUser(id)
      if (!result) return error(res, 'User not found or delete failed', [], 404)

      return success(res, result, 'User deleted successfully', 200)
    } catch (err) {
      return error(res, 'Error deleting user', [{ message: err.message }], 500)
    }
  }

  

  return { getUsers, patchUser, deleteUser, createUser }
}
