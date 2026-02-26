import { getDb } from '../../config/dbswitch.js'
// import { MySQLTaskRepo } from './task.mysql.js'
import { PostgresTaskRepo } from './task.postgres.js'
// import { MongoTaskRepo } from './task.mongo.js'

const DB_TYPE = process.env.DB_TYPE || 'mysql'
const Repo =
  DB_TYPE === 'mongo'
    ? MongoTaskRepo
    : DB_TYPE === 'postgres'
    ? PostgresTaskRepo
    : MySQLTaskRepo

const taskModel = {
  // Tasks
  getTasks: options => Repo.getTasks(getDb(), options),

  countTasks: options => Repo.countTasks(getDb(), options),

  getTaskById: id => Repo.getTaskById(getDb(), id),

  createTask: taskData =>
    Repo.createTask
      ? Repo.createTask(getDb(), taskData) // Mongo-style / MySQL-style
      : Repo.insertTask(getDb(), taskData), // fallback if some repo uses insertTask

  patchTask: (id, updates) => Repo.patchTask(getDb(), id, updates),

  deleteTask: id => Repo.deleteTask(getDb(), id),

  createNotification: (user_id, title) =>
    Repo.createNotification(getDb(), user_id, title),
}

export default taskModel