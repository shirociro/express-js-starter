import express from 'express'

export const jsonParser = express.json({ limit: '50mb' })
export const urlencodedParser = express.urlencoded({ extended: true, limit: '50mb' })

export const malformedJsonHandler = (err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    console.warn('Malformed JSON body received:', err.message)
    return res.status(400).json({ ok: false, error: 'Malformed JSON body' })
  }
  next(err)
}
