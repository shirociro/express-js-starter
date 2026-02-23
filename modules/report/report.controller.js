export function createReportController({ reportService }) {
  return {
    async taskPdf(req, res) {
      const buffer = await reportService.generateTaskPdf(req.query)

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.pdf')

      return res.send(buffer)
    },

    async taskExcel(req, res) {
      const buffer = await reportService.generateTaskExcel(req.query)

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.xlsx')

      return res.send(buffer)
    },
  }
}
