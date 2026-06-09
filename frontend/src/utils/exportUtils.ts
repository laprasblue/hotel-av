import * as XLSX from 'xlsx'

/** Export data to .xlsx file. `columns` maps display headers to object keys. */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: { header: string; key: keyof T; format?: (v: unknown) => string }[],
  filename: string,
  sheetName = 'Data',
) {
  const rows = data.map((item) => {
    const row: Record<string, unknown> = {}
    columns.forEach((col) => {
      row[col.header] = col.format ? col.format(item[col.key]) : item[col.key]
    })
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows)

  // Auto column width
  const colWidths = columns.map((col) => ({
    wch: Math.max(
      col.header.length + 2,
      ...rows.map((r) => String(r[col.header] ?? '').length),
    ),
  }))
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Open a print-preview window with an HTML table and trigger browser Print → Save as PDF.
 * This approach supports all characters (Vietnamese, etc.) via the browser's native font.
 */
export function exportToPDF(
  title: string,
  headers: string[],
  rows: string[][],
  filename: string,
) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell ?? ''}</td>`).join('')}</tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page { margin: 16mm; size: A4 landscape; }
  body { font-family: Arial, 'Segoe UI', sans-serif; font-size: 11px; color: #111; }
  h2 { font-size: 15px; margin: 0 0 4px; }
  .sub { font-size: 11px; color: #6b7280; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #1d4ed8; color: #fff; padding: 7px 10px; text-align: left; font-size: 11px; }
  tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  .footer { margin-top: 14px; font-size: 10px; color: #9ca3af; }
</style>
</head>
<body>
<h2>${title}</h2>
<div class="sub">Xuất lúc: ${new Date().toLocaleString('vi-VN')} &nbsp;·&nbsp; Tổng: ${rows.length} dòng</div>
<table>
  <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">Hotel Manager — ${filename}</div>
<script>window.onload = () => { window.print(); window.onafterprint = () => window.close() }</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'width=960,height=700')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
