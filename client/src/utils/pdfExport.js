import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'

export async function generatePDFReport() {
  const reportContainer = document.getElementById('pdf-report-container')
  if (!reportContainer) {
    toast.error('Report template not found')
    return
  }

  // Ensure it's temporarily visible but off-screen
  reportContainer.style.display = 'block'
  reportContainer.style.position = 'absolute'
  reportContainer.style.left = '-9999px'
  reportContainer.style.top = '0'

  toast.loading('Compiling Business Report...', { id: 'pdf' })

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4', // ~595 x 842 pt
    })

    const pages = reportContainer.querySelectorAll('.pdf-page')
    
    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i]
      
      const canvas = await html2canvas(pageEl, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#0F172A',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      
      // A4 dimensions at 72 dpi (px) is 595 x 842.
      // We scale the image to fit strictly within the A4 dimensions.
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // The container pages are fixed dimension (e.g. 794x1123 which is standard A4 at 96 DPI)
      // So it will automatically map cleanly if the ratio is standard.
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)

      if (i < pages.length - 1) {
        pdf.addPage()
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    pdf.save(`customer_analytics_report_${timestamp}.pdf`)
    toast.success('Report successfully exported!', { id: 'pdf' })
  } catch (error) {
    console.error(error)
    toast.error('Failed to generate PDF', { id: 'pdf' })
  } finally {
    // Hide it again
    reportContainer.style.display = 'none'
  }
}
