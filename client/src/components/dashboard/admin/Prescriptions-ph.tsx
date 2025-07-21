import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/utils/pagination'
import { usePharmacyData } from '@/hooks/useDashboard'
import dayjs from 'dayjs'
import type { TPrescription } from '@/types/api-types'
import { Card } from '@/components/ui/card'

export default function PharmacyPrescriptionsTable() {
  const { prescriptions } = usePharmacyData()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filteredData = useMemo(() => {
    return prescriptions.filter((p: TPrescription) => {
      const matchesSearch =
        p.diagnosis?.diagnosis_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter ? p.status === statusFilter : true

      return matchesSearch && matchesStatus
    })
  }, [prescriptions, searchTerm, statusFilter])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage, rowsPerPage])

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="p-4 rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <Input
            placeholder="Search by patient, diagnosis, or number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem
                value="all"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                All
              </SelectItem>
              <SelectItem
                value="active"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Active
              </SelectItem>
              <SelectItem
                value="pending"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Pending
              </SelectItem>
              <SelectItem
                value="completed"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Completed
              </SelectItem>
              <SelectItem
                value="cancelled"
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Diagnosis</th>
                <th className="px-4 py-2">Prescription No</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Medications</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((p) => (
                  <tr
                    key={p.prescription_id}
                    className="border-t dark:border-gray-700"
                  >
                    <td className="px-4 py-2">
                      {p.diagnosis?.patient?.first_name}{' '}
                      {p.diagnosis?.patient?.last_name}
                    </td>
                    <td className="px-4 py-2">{p.diagnosis?.diagnosis_name}</td>
                    <td className="px-4 py-2">{p.prescription_number}</td>
                    <td className="px-4 py-2">
                      {p.prescription_date
                        ? dayjs(p.prescription_date).format('MMM D, YYYY')
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2 capitalize">{p.status}</td>
                    <td className="px-4 py-2">
                      <ul className="list-disc list-inside space-y-1">
                        {p.prescriptionMedications?.map((med) => (
                          <li key={med.id}>{med.medication.name}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No prescriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalCount={filteredData.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows)
            setCurrentPage(1)
          }}
        />
      </Card>
    </div>
  )
}
