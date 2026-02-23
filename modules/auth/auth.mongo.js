import { ObjectId } from 'mongodb'

// Private helper to map _id to id
const mapId = doc => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

export const MongoUserRepo = {
  async findByUsername(db, username) {
    const user = await db.collection('users').findOne({ username })
    return mapId(user)
  },

  async findById(db, id) {
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) })
    return mapId(user)
  },

  async insertUser(db, { username, hashedPassword, firstname, lastname }) {
    const result = await db.collection('users').insertOne({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      created_at: new Date(),
    })
    return result.insertedId.toString()
  },

  async insertRefreshToken(db, userId, token, expiresAt) {
    await db.collection('refresh_tokens').insertOne({
      user_id: new ObjectId(userId),
      token,
      expires_at: new Date(expiresAt),
    })
  },

  async logAction(db, userId, action) {
    await db.collection('logs').insertOne({
      user_id: userId,
      action,
      created_at: new Date(),
    })
  },

  async getAllUsers(db) {
    const users = await db.collection('users').find({}).toArray()
    return users.map(mapId)
  },
}
