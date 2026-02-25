import logger from '../utils/logger.js'

export function errorLogger(err, req, res, next) {
  logger.error(`ERROR: ${err.message} | URL: ${req.method} ${req.url} | STACK: ${err.stack}`)

  // Move to next handler (your errorHandler)
  next(err)
}
