import PDFDocument from 'pdfkit'

export const pdfGenerator = {
  generate(data) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 })
      const chunks = []

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })
      doc.on('error', reject)

      // ---- PDF CONTENT ----
      doc.fontSize(18).text('Task Report', { align: 'center' })
      doc.moveDown()

      data.forEach(task => {
        doc.fontSize(12).text(`• ${task.firstname}`).moveDown(0.5)
      })

      doc.end()
    })
  },
}
