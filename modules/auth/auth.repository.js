import { getDb } from '../../config/dbswitch.js'
import { MongoUserRepo } from './auth.mongo.js'
import { MySQLUserRepo } from './auth.mysql.js'

const DB_TYPE = process.env.DB_TYPE || 'mysql'
const Repo = DB_TYPE === 'mongo' ? MongoUserRepo : MySQLUserRepo

const authModel = {
  findByUsername: username => Repo.findByUsername(getDb(), username),

  findById: id => Repo.findById(getDb(), id),

  findRefreshToken: token => Repo.findRefreshToken(getDb(), token),

  insertUser: userData => Repo.insertUser(getDb(), userData),

  insertRefreshToken: (userId, token, expiresAt) =>
    Repo.insertRefreshToken(getDb(), userId, token, expiresAt),

  logAction: (userId, action) => Repo.logAction(getDb(), userId, action),

  getAllUsers: () => Repo.getAllUsers(getDb()),
}

export default authModel
