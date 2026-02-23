export function createStackController(stackService, { success, error }) {
  async function getStacks(req, res) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : null
      const search = req.query.search || ''
      const position = req.query.position ? parseInt(req.query.position, 10) : 0

      const rows = await stackService.getStacks({ page, limit, search, position })
      res.json(rows)
    } catch (err) {
      return error(res, 'Error deleting user', [{ message: err.message }], 500)
    }
  }

  async function patchStack(req, res) {
    try {
      const { id } = req.params
      const updates = req.body
      const file = req.file
      const removeLogo = updates.remove_logo

      if (!id) return error(res, 'User ID is required', [], 400)
      if (!updates && !file) return error(res, 'No data provided', [], 400)

      const result = await stackService.patchStack(id, updates, file, removeLogo)

      if (!result) return error(res, 'User not found or update failed', [], 404)
      return success(res, result, 'User updated successfully', 200)
    } catch (err) {
      console.error(err)
      return error(res, 'Error updating user', [{ message: err.message }], 500)
    }
  }

  async function deleteStack(req, res) {
    try {
      const { id } = req.params
      if (!id) return error(res, 'Stack ID is required', [], 400)

      const result = await stackService.deleteStack(id)
      if (!result) return error(res, 'User not found or delete failed', [], 404)

      return success(res, result, 'Stack deleted successfully', 200)
    } catch (err) {
      return error(res, 'Error deleting stack', [{ message: err.message }], 500)
    }
  }

  async function createStack(req, res) {
    try {
      const data = req.body
      if (!data || Object.keys(data).length === 0) {
        return error(res, 'No user data provided', [], 400)
      }

      const createdStack = await stackService.createStack(data)

      return success(res, createdStack, 'Stack created successfully', 201)
    } catch (err) {
      return error(res, 'Error creating stack', [{ message: err.message }], 500)
    }
  }

  return { getStacks, patchStack, deleteStack, createStack }
}
