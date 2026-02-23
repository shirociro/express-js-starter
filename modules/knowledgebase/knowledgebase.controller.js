export function createKnowledgebaseController(service, { success, error }) {
  async function getKnowledgebase(req, res) {
    try {
      const result = await service.getKnowledgebase(req.query)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function createKnowledgebase(req, res) {
    try {
      const result = await service.createKnowledgebase(req.body)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function patchKnowledgebase(req, res) {
    try {
      const id = parseInt(req.params.id)
      const result = await service.patchKnowledgebase(id, req.body)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  async function deleteKnowledgebase(req, res) {
    try {
      const id = parseInt(req.params.id)
      const result = await service.deleteKnowledgebase(id)
      return result.ok
        ? success(res, result.data, result.message, result.status)
        : error(res, result.message, [], result.status)
    } catch (err) {
      return error(res, 'Server error', [{ message: err.message }], 500)
    }
  }

  return { getKnowledgebase, createKnowledgebase, patchKnowledgebase, deleteKnowledgebase }
}
