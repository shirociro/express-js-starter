export function createReportService({ reportModel, pdfGenerator, excelGenerator }) {
  return {
    async generateTaskPdf(filters) {
      const data = await reportModel.getTaskReport(filters)
      return pdfGenerator.generate(data)
    },

    async generateTaskExcel(filters) {
      const data = await reportModel.getTaskReport(filters)
      return excelGenerator.generate(data)
    },
  }
}
