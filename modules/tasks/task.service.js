export function createTaskService({ taskModel, emitter }) {
  const ALLOWED_FIELDS = ['title', 'description', 'priority', 'status', 'user_id']

  return {
    async getTasks({ page = 1, limit = 10, search = '' }) {
      try {
        // Call model and get { rows, total }
        const { rows: tasks, total } = await taskModel.getTasks({ page, limit, search })

        return {
          ok: true,
          status: 200,
          message: 'Tasks fetched successfully',
          data: {
            items: tasks,
            meta: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          },
        }
      } catch (err) {
        return {
          ok: false,
          status: 500,
          message: err.message || 'Failed to fetch tasks',
          data: null,
        }
      }
    },

    async createTask({ title, description, priority, status, user_id }) {
      try {
        if (!title || !title.trim()) {
          return {
            ok: false,
            status: 400,
            message: 'Title is required',
            data: null,
          }
        }

        const result = await taskModel.createTask({ title, description, priority, status, user_id })

        if (user_id) {
          await taskModel.createNotification(user_id, title)
        }

        const newTask = await taskModel.getTaskById(result.insertId)

        return {
          ok: true,
          status: 201,
          message: 'Task created successfully',
          data: newTask,
        }
      } catch (err) {
        return {
          ok: false,
          status: 500,
          message: err.message || 'Failed to create task',
          data: null,
        }
      }
    },

    async patchTask(id, updates) {
      try {
        const existing = await taskModel.getTaskById(id)

        if (!existing) {
          return {
            ok: false,
            status: 404,
            message: 'Task not found',
            data: null,
          }
        }

        const filteredUpdates = Object.keys(updates)
          .filter(k => ALLOWED_FIELDS.includes(k))
          .reduce((obj, k) => ((obj[k] = updates[k]), obj), {})

        if (!Object.keys(filteredUpdates).length) {
          return {
            ok: false,
            status: 400,
            message: 'No valid fields provided',
            data: null,
          }
        }

        await taskModel.patchTask(id, filteredUpdates)
        const updatedTask = await taskModel.getTaskById(id)

        return {
          ok: true,
          status: 200,
          message: 'Task updated successfully',
          data: updatedTask,
        }
      } catch (err) {
        return {
          ok: false,
          status: 500,
          message: err.message || 'Failed to update task',
          data: null,
        }
      }
    },

    async deleteTask(id) {
      try {
        const deleted = await taskModel.deleteTask(id)

        if (!deleted) {
          return {
            ok: false,
            status: 404,
            message: 'Task not found',
            data: null,
          }
        }

        return {
          ok: true,
          status: 200,
          message: 'Task deleted successfully',
          data: { id },
        }
      } catch (err) {
        return {
          ok: false,
          status: 500,
          message: err.message || 'Failed to delete task',
          data: null,
        }
      }
    },
  }
}
