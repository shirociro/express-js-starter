export const PostgresTaskRepo = {
  // 1️⃣ Fetch tasks with pagination, search
  async getTasks(db, { page = 1, limit = 10, search = '' }) {
    const start = limit ? (page - 1) * limit : 0
    const params = []
    let paramIndex = 1

    let baseQuery = `
      FROM tbl_tasks t
      LEFT JOIN tbl_users u ON t.user_id = u.id
      WHERE 1=1
    `

    if (search) {
      baseQuery += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex + 1})`
      params.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
      page = 1
    }

    // Total count
    const countRes = await db.query(`SELECT COUNT(*) AS total ${baseQuery}`, params)
    const total = parseInt(countRes.rows[0]?.total || 0)

    // Main query
    let query = `
      SELECT 
        t.id, t.user_id, u.firstname, u.lastname,
        t.title, t.description, t.status, t.priority,
        t.created_at, t.updated_at
      ${baseQuery}
      ORDER BY t.created_at DESC
    `

    if (limit) {
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, start)
    }

    const { rows } = await db.query(query, params)
    return { rows, total, page, limit }
  },

  // 2️⃣ Count tasks (for convenience)
  async countTasks(db, { search = '' }) {
    const params = []
    let paramIndex = 1

    let baseQuery = `FROM tbl_tasks t WHERE 1=1`
    if (search) {
      baseQuery += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex + 1})`
      params.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    const countRes = await db.query(`SELECT COUNT(*) AS total ${baseQuery}`, params)
    return parseInt(countRes.rows[0]?.total || 0)
  },

  // 3️⃣ Get single task by ID
  async getTaskById(db, id) {
    const { rows } = await db.query(`
      SELECT 
        t.id, t.user_id, u.firstname, u.lastname,
        t.title, t.description, t.status, t.priority,
        t.created_at, t.updated_at
      FROM tbl_tasks t
      LEFT JOIN tbl_users u ON t.user_id = u.id
      WHERE t.id = $1
    `, [id])
    return rows[0] || null
  },

  // 4️⃣ Create task
  async createTask(db, { title, description, priority, status, user_id }) {
    const { rows } = await db.query(`
      INSERT INTO tbl_tasks (title, description, priority, status, created_at, user_id)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING id, title, description, priority, status, user_id, created_at, updated_at
    `, [title, description, priority, status, user_id || null])
    return rows[0]
  },

  // 5️⃣ Update/patch task dynamically
  async patchTask(db, id, updates) {
    if (!id) throw new Error('Task ID is required')
    const keys = Object.keys(updates)
    if (!keys.length) return null

    const fields = keys.map((k, idx) => `${k} = $${idx + 1}`)
    const values = keys.map(k => updates[k])
    values.push(id) // For WHERE clause

    const sql = `
      UPDATE tbl_tasks
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *
    `
    const { rows } = await db.query(sql, values)
    return rows[0] || null
  },

  // 6️⃣ Delete task
  async deleteTask(db, id) {
    const { rowCount } = await db.query(`DELETE FROM tbl_tasks WHERE id = $1`, [id])
    return rowCount > 0
  },

  // 7️⃣ Create notification for a user
  async createNotification(db, user_id, title) {
    await db.query(`
      INSERT INTO tbl_notifications (user_id, message, is_read)
      VALUES ($1, $2, false)
    `, [user_id, `Task: ${title} assigned to you`])
  }
}