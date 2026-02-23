import { getDb } from '../config/db.js'

export const MetaModel = {
  getPositions: async () => {
    const db = getDb()
    const [positions] = await db.execute('SELECT * FROM user_position ORDER BY name ASC')
    return positions
  },

  getRoles: async () => {
    const db = getDb()
    const [roles] = await db.execute('SELECT * FROM user_role ORDER BY name ASC')
    return roles
  },

  getUsers: async () => {
    const db = getDb()
    const [users] = await db.execute('SELECT * FROM users ORDER BY firstname ASC')
    return users
  },
}
