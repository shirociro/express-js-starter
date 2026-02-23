import { getEmailClient } from './email.client.js'

export async function sendEmail({ to, from, subject, text, html }) {
  const transporter = getEmailClient()

  return transporter.sendMail({
    to,
    from,
    subject,
    text,
    html,
  })
}
