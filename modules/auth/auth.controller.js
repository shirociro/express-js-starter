export function createAuthController(authService, { success, error }) {
  async function login(req, res) {
    try {
      const result = await authService.login(req.body)
      if (!result.ok) return error(res, result.message, [], result.status)
      return success(res, result.data, result.message, result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function register(req, res) {
    try {
      const result = await authService.register(req.body)
      if (!result.ok) return error(res, result.message, result.errors || [], result.status)
      return success(res, result.data, result.message, result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function listUsers(req, res) {
    try {
      const result = await authService.listUsers()
      if (!result.ok) return error(res, result.message, result.errors || [], result.status)
      return success(res, result.data, result.message, result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  return { login, register, listUsers }
}
