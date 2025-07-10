
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePdf } from '../utils/invoices'

export default function DownloadInvoice({ invoiceData }: { invoiceData: any }) {
  return (
    <PDFDownloadLink
      document={<InvoicePdf invoice={invoiceData} />}
      fileName={`${invoiceData.invoiceNumber}.pdf`}
      className='dark:bg-gray-700 dark:text-gray-200 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors'
    >
      {({ loading }) =>
        loading ? 'Preparing Invoice...' : 'Download Invoice PDF'
      }
    </PDFDownloadLink>
  )
}
