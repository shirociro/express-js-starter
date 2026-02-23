export const success = (res, data = {}, message = 'Success', status = 200) => {
  return res.status(status).json({
    ok: true,
    message,
    data,
  })
}

export const error = (res, message = 'Error', errors = [], status = 400) => {
  return res.status(status).json({
    ok: false,
    message,
    errors,
  })
}
