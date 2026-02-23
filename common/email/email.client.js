import nodemailer from 'nodemailer'

let transporter

export function getEmailClient() {
  if (transporter) return transporter

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASS')
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  })

  return transporter
}
