export const PostgresUserRepo = {
  // 1. Fetch user by username
  async findByUsername(db, username) {
    const { rows } = await db.query(
      'SELECT * FROM tbl_users WHERE username = $1 LIMIT 1',
      [username]
    )
    return rows[0] || null
  },

  // 2. Fetch user by ID
  async findById(db, id) {
    const { rows } = await db.query(
      `SELECT id, firstname, lastname, username, role_id, position, profile, created_at 
       FROM tbl_users 
       WHERE id = $1`,
      [id]
    )
    return rows[0] || null
  },

  // 3. Insert new user
  async insertUser(db, { username, hashedPassword, firstname, lastname }) {
    const { rows } = await db.query(
      `INSERT INTO tbl_users (username, password, firstname, lastname, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [username, hashedPassword, firstname, lastname]
    )

    return rows[0].id
  },

  // 4. Save refresh token
  async insertRefreshToken(db, userId, token, expiresAt) {
    await db.query(
      `INSERT INTO tbl_refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    )
  },

  // 5. Find refresh token
  async findRefreshToken(db, token) {
    const { rows } = await db.query(
      'SELECT * FROM tbl_refresh_tokens WHERE token = $1',
      [token]
    )
    return rows[0] || null
  },

  // 6. Log user action
  async logAction(db, userId, action) {
    await db.query(
      `INSERT INTO tbl_logs (user_id, action, created_at)
       VALUES ($1, $2, NOW())`,
      [userId, action]
    )
  },

  // 7. Fetch all users
  async getAllUsers(db) {
    const { rows } = await db.query(
      `SELECT id, firstname, lastname, username, role_id, position, profile, created_at 
       FROM tbl_users`
    )
    return rows
  },
}