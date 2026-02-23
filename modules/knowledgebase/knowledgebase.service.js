export function createKnowledgebaseService({ knowledgebaseModel, emitter, EVENTS }) {
  const ALLOWED_FIELDS = ['title', 'description']

  return {
    async getKnowledgebase({ page = 1, limit = 10, search = '' }) {
      const offset = (page - 1) * limit
      const [rows, total] = await Promise.all([
        knowledgebaseModel.getKnowledgebase({ page, limit, search, offset }),
        knowledgebaseModel.countKnowledgebase({ search }),
      ])

      return {
        ok: true,
        status: 200,
        message: 'Knowledgebase fetched successfully',
        data: {
          items: rows,
          meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      }
    },

    async createKnowledgebase({ title, description }) {
      if (!title || !title.trim())
        return {
          ok: false,
          status: 400,
          message: 'Title is required',
          data: null,
        }

      const result = await knowledgebaseModel.createKnowledgebase({ title, description })
      const newKB = await knowledgebaseModel.getKnowledgebaseById(result.insertId)

      if (emitter) emitter.emit(EVENTS.KNOWLEDGEBASE_CREATED, newKB)

      return {
        ok: true,
        status: 201,
        message: 'Knowledgebase entry created successfully',
        data: newKB,
      }
    },

    async patchKnowledgebase(id, updates) {
      const existing = await knowledgebaseModel.getKnowledgebaseById(id)
      if (!existing)
        return {
          ok: false,
          status: 404,
          message: 'Knowledgebase entry not found',
          data: null,
        }

      const filteredUpdates = Object.keys(updates)
        .filter(k => ALLOWED_FIELDS.includes(k))
        .reduce((obj, k) => ((obj[k] = updates[k]), obj), {})

      if (!Object.keys(filteredUpdates).length)
        return {
          ok: false,
          status: 400,
          message: 'No valid fields provided',
          data: null,
        }

      await knowledgebaseModel.patchKnowledgebase(id, filteredUpdates)
      const updatedKB = await knowledgebaseModel.getKnowledgebaseById(id)

      if (emitter) emitter.emit(EVENTS.KNOWLEDGEBASE_UPDATED, updatedKB)

      return {
        ok: true,
        status: 200,
        message: 'Knowledgebase entry updated successfully',
        data: updatedKB,
      }
    },

    async deleteKnowledgebase(id) {
      const deleted = await knowledgebaseModel.deleteKnowledgebase(id)
      if (!deleted)
        return {
          ok: false,
          status: 404,
          message: 'Knowledgebase entry not found',
          data: null,
        }

      if (emitter) emitter.emit(EVENTS.KNOWLEDGEBASE_DELETED, id)

      return {
        ok: true,
        status: 200,
        message: 'Knowledgebase entry deleted successfully',
        data: { id },
      }
    },
  }
}
