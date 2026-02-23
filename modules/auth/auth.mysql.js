export const MySQLUserRepo = {
  // 1. Fetch user by username
  async findByUsername(db, username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username])
    return rows[0] || null
  },

  // 2. Fetch user by ID
  async findById(db, id) {
    const [rows] = await db.query(
      'SELECT id, firstname, lastname, username, role_id, position, profile, created_at FROM users WHERE id = ?',
      [id]
    )
    return rows[0] || null
  },

  // 3. Insert new user
  async insertUser(db, { username, hashedPassword, firstname, lastname }) {
    const [result] = await db.query(
      'INSERT INTO users (username, password, firstname, lastname, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, hashedPassword, firstname, lastname]
    )
    return result.insertId
  },

  // 4. Save refresh token
  async insertRefreshToken(db, userId, token, expiresAt) {
    await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
      userId,
      token,
      expiresAt,
    ])
  },

  // 5. Find refresh token
  async findRefreshToken(db, token) {
    const [rows] = await db.query('SELECT * FROM refresh_tokens WHERE token = ?', [token])
    return rows[0] || null
  },

  // 6. Log user action
  async logAction(db, userId, action) {
    await db.query('INSERT INTO logs (user_id, action, created_at) VALUES (?, ?, NOW())', [
      userId,
      action,
    ])
  },

  // 7. Fetch all users
  async getAllUsers(db) {
    const [rows] = await db.query(
      'SELECT id, firstname, lastname, username, role_id, position, profile, created_at FROM users'
    )
    return rows
  },
}
