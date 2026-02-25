// import { sendEmail } from '../../shared/email/email.index.js'
// import { contactEmailTemplate } from './templates/template1.template.js'

// export const sendContactEmail = async (payload) => {
//   try {
//     const { name, email, message, subject, to } = payload

//     if (!name || !email || !message) {
//       throw new Error('name, email and message are required')
//     }

//     const tpl = contactEmailTemplate({ name, email, message })

//     await sendEmail({
//       to: to || process.env.TO_EMAIL || process.env.GMAIL_USER,
//       from: process.env.FROM_EMAIL || `"${name}" <${email}>`,
//       subject: subject || tpl.subject,
//       text: tpl.text,
//       html: tpl.html,
//     })
//   } catch (err) {
//     // keep service errors clean and rethrow
//     throw err
//   }
// }

import { sendEmail } from '../../shared/email/email.index.js'
import { contactEmailTemplate } from './templates/template1.template.js'

export const sendContactEmail = async payload => {
  const { name, email, message, subject, to } = payload

  if (!name || !email || !message) {
    throw new Error('name, email, and message are required')
  }

  const tpl = contactEmailTemplate({ name, email, message })

  await sendEmail({
    to: to || process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL, // MUST match Gmail account
    replyTo: `"${name}" <${email}>`, // correct way to capture sender
    subject: subject || tpl.subject,
    text: tpl.text,
    html: tpl.html,
  })
}
