import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './modules/auth/auth.router.js'
import usersRoutes from './modules/users/user.router.js'
import tasksRoutes from './modules/tasks/task.router.js'
import knowledgebaseRoutes from './modules/knowledgebase/knowledgebase.router.js'
import emailRoutes from './modules/email/email.router.js'
import reportRouter from './modules/report/report.router.js'
import healthRoutes from './modules/health/health.router.js'

// import registerUserEvents from './modules/tasks/task.events.js'

import metaRoutes from './modules/meta/meta.router.js'
import {
  jsonParser,
  urlencodedParser,
  malformedJsonHandler,
} from './shared/middleware/bodyParser.js'
import { errorHandler } from './shared/middleware/errorHandler.js'
import { errorLogger } from './shared/middleware/errorLogger.js'

import { initDb } from './config/dbswitch.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',           // local dev
  'https://react-task-manager-uo5a.onrender.com', // production
  'https://vue-projects-nggr.onrender.com',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // allow cookies/auth headers
}));
app.use(jsonParser)
app.use(urlencodedParser)

// Handle malformed JSON
app.use(malformedJsonHandler)
app.use(helmet())

app.use('/reports', reportRouter)

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/tasks', tasksRoutes)
app.use('/knowledgebase', knowledgebaseRoutes)
app.use('/health', healthRoutes)
app.use('/email', emailRoutes)
app.use('/meta', metaRoutes)

// app.use(registerUserEvents)
// app.use(errorLogger)
// app.use(errorHandler)
export async function createApp() {
  await initDb()
  return app
  // const db = await initDb()
  // app.use((req, res, next) => {
  //   req.db = db
  //   next()
  // })
}

export default app
