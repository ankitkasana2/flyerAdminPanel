"use client"

import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

// Excel export utility
export const exportToExcel = (data: any[], filename: string, sheetName = "Sheet1") => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// PDF export utility with table formatting
export const exportToPDF = (title: string, columns: string[], data: any[][], filename: string) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Add title
  doc.setFontSize(16)
  doc.text(title, pageWidth / 2, 15, { align: "center" })

  // Add date
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: "center" })

  // Add table
  ;(doc as any).autoTable({
    head: [columns],
    body: data,
    startY: 30,
    theme: "dark",
    headStyles: {
      fillColor: [229, 9, 20],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 30 },
  })

  doc.save(`${filename}.pdf`)
}

// Generate CSV
export const exportToCSV = (data: any[], filename: string) => {
  const csv = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
}
