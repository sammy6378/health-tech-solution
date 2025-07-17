import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { PaymentMethod, PaymentStatus} from '@/types/api-types'
import { useUserData } from '@/hooks/useDashboard'

export default function BillingPage() {
  const {payments} = useUserData()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Filter payments based on selected filters and search query
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus =
      statusFilter === 'all' || payment.payment_status === statusFilter
    const matchesMethod =
      methodFilter === 'all' || payment.payment_method === methodFilter
    const matchesSearch =
      searchQuery === '' ||
      payment.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.paystack_reference &&
        payment.paystack_reference
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesMethod && matchesSearch
  })

  // Calculate summary statistics
  const totalPaid = payments
    .filter((p) => p.payment_status === PaymentStatus.PAID)
    .reduce((sum, payment) => sum + payment.amount, 0)
  
  const pendingAmount = payments
    .filter((p) => p.payment_status === PaymentStatus.PENDING)
    .reduce((sum, payment) => sum + payment.amount, 0)

  const getStatusBadge = (status: PaymentStatus) => {
    const statusMap = {
      [PaymentStatus.PAID]: { text: 'Paid', variant: 'success' },
      [PaymentStatus.PENDING]: { text: 'Pending', variant: 'warning' },
      [PaymentStatus.FAILED]: { text: 'Failed', variant: 'destructive' },
      [PaymentStatus.REFUNDED]: { text: 'Refunded', variant: 'secondary' },
    }
    const { text, variant } = statusMap[status]
    return <Badge variant={variant as any}>{text}</Badge>
  }

  const getMethodBadge = (method: PaymentMethod) => {
    const methodMap = {
      [PaymentMethod.CASH]: { text: 'Cash', variant: 'default' },
      [PaymentMethod.CREDIT_CARD]: { text: 'Credit Card', variant: 'default' },
      [PaymentMethod.MOBILE_MONEY]: { text: 'Mobile Money', variant: 'default' },
    }
    const { text, variant } = methodMap[method]
    return <Badge variant={variant as any}>{text}</Badge>
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Billing History
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {payments.length}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Amount Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                KES {Number(totalPaid)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                KES {pendingAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by order # or transaction ID"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem
                      value="all"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      All Statuses
                    </SelectItem>
                    {Object.values(PaymentStatus).map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by method" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem
                      value="all"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      All Methods
                    </SelectItem>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem
                        key={method}
                        value={method}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {method === 'mobile_money'
                          ? 'Mobile Money'
                          : method === 'credit_card'
                            ? 'Credit Card'
                            : 'Cash'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-700">
                <TableHead className="w-[120px]">Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.payment_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                      {payment.order_number}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(payment.payment_method)}
                    </TableCell>
                    <TableCell className="font-medium">
                      KES {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.payment_status)}
                    </TableCell>
                    <TableCell>{payment.paystack_reference || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No payments found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}