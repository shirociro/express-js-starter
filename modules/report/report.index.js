import reportRouter from './report.router.js'
import { createReportController } from './report.controller.js'
import { createReportService } from './report.service.js'
import { createReportModel } from './report.model.js'

import { pdfGenerator } from './generators/pdf.generator.js'
import { excelGenerator } from './generators/excel.generator.js'

const reportModel = createReportModel()

const reportService = createReportService({
  reportModel,
  pdfGenerator,
  excelGenerator,
})

const reportController = createReportController({
  reportService,
})

export { reportRouter, reportController }
