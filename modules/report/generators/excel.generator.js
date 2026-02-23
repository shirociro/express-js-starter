import ExcelJS from 'exceljs'

export const excelGenerator = {
  async generate(data) {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Tasks')

    sheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Firstname', key: 'firstname' },
      { header: 'Lastname', key: 'lastname' },
      { header: 'Task Title', key: 'title' },
      { header: 'Task Description', key: 'description' },
      { header: 'Task Status', key: 'status' },
      { header: 'Task Priority', key: 'priority' },
    ]

    sheet.addRows(data)

    return workbook.xlsx.writeBuffer()
  },
}
