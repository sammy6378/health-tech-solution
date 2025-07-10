import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #eee',
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 10,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 13,
    marginTop: 20,
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '1 solid #eee',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    textAlign: 'right',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #000',
    paddingBottom: 4,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    paddingVertical: 4,
  },
  cell1: { width: '60%' },
  cell2: { width: '20%', textAlign: 'right' },
  cell3: { width: '20%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 9,
    borderTop: '1 solid #eee',
    paddingTop: 10,
    textAlign: 'center',
    color: '#666',
  },
})

export const InvoicePdf = ({ invoice }: { invoice: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>Telemed Care Ltd.</Text>
            <Text>+254 712 345 678</Text>
            <Text>support@telemedcare.co.ke</Text>
            <Text>Nairobi, Kenya</Text>
          </View>
        </View>
      </View>

      {/* Invoice Info */}
      <View>
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Invoice #:</Text>
          <Text>{invoice.invoiceNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text>{invoice.orderDate}</Text>
        </View>
      </View>

      {/* Billing Info */}
      <View>
        <Text style={styles.sectionTitle}>Billed To</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Patient:</Text>
          <Text>{invoice.patientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Doctor:</Text>
          <Text>{invoice.doctorName}</Text>
        </View>
      </View>

      {/* Order Summary */}
      <View>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Service:</Text>
          <Text>{invoice.service}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text>{invoice.paymentMethod}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Status:</Text>
          <Text>{invoice.paymentStatus}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Method:</Text>
          <Text>{invoice.deliveryMethod}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Address:</Text>
          <Text>{invoice.deliveryAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Time:</Text>
          <Text>{invoice.deliveryTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estimated Delivery:</Text>
          <Text>{invoice.estimatedDelivery}</Text>
        </View>
      </View>

      {/* Billing Table */}
      <View>
        <Text style={styles.sectionTitle}>Billing</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.cell1}>Description</Text>
          <Text style={styles.cell2}>Qty</Text>
          <Text style={styles.cell3}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.cell1}>{invoice.service}</Text>
          <Text style={styles.cell2}>1</Text>
          <Text style={styles.cell3}>KES {invoice.amountPaid}</Text>
        </View>
        <View
          style={[styles.tableRow, { borderTop: '1 solid #000', marginTop: 4 }]}
        >
          <Text style={styles.cell1}>Total</Text>
          <Text style={styles.cell2}></Text>
          <Text style={styles.cell3}>KES {invoice.amountPaid}</Text>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text>{invoice.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        Thank you for choosing Telemed Care. For inquiries, contact
        support@telemedcare.co.ke
      </Text>
    </Page>
  </Document>
)
