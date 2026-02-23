export function contactEmailTemplate({ name, email, message }) {
  return {
    subject: `Message from ${name}`,
    text: `${message}\n\nFrom: ${name} <${email}>`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #1a73e8; margin-bottom: 20px;">You've got a new message!</h2>

        <p style="margin-bottom: 20px;">${message.replace(/\n/g, '<br>')}</p>

        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />

        <p style="margin: 0;">From:</p>
        <p style="margin: 0; font-weight: bold;">${name} &lt;${email}&gt;</p>

        <footer style="margin-top: 30px; font-size: 12px; color: #888;">
          This email was sent from your website contact form.
        </footer>
      </div>
    `,
  }
}
