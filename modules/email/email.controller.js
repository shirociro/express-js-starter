import * as contactService from './email.service.js'

export const sendContact = async (req, res) => {
  try {
    await contactService.sendContactEmail(req.body)

    res.status(200).json({
      status: 'success',
      timestamp: new Date(),
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      status: 'error',
      message: err.message,
      timestamp: new Date(),
    })
  }
}
