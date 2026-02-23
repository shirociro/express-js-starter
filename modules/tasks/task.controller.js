export function createTaskController(taskService, { success, error }) {
  async function getTasks(req, res) {
    try {
      const result = await taskService.getTasks(req.query)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function createTask(req, res) {
    try {
      const result = await taskService.createTask(req.body)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function patchTask(req, res) {
    try {
      const id = parseInt(req.params.id)
      const result = await taskService.patchTask(id, req.body)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function deleteTask(req, res) {
    try {
      const id = parseInt(req.params.id)
      const result = await taskService.deleteTask(id)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  return { getTasks, createTask, patchTask, deleteTask }
}
