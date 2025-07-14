import { useDoctorData } from '@/hooks/useDashboard'
import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Search } from 'lucide-react'
import dayjs from 'dayjs'
import type { TPrescription } from '@/types/api-types'

export default function PatientPrescriptionsPage() {
  const { prescriptions: dp } = useDoctorData()

  console.log('Doctor Prescriptions:', dp)

  const [selectedPrescription, setSelectedPrescription] =
    useState<TPrescription | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const prescriptions = dp || []

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription:TPrescription) => {
      const statusMatch = statusFilter
        ? prescription.status.toLowerCase() === statusFilter.toLowerCase()
        : true

      const searchMatch = searchTerm
        ? prescription.prescription_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${prescription.doctor?.first_name || ''} ${prescription.patient?.last_name || ''}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true

      return statusMatch && searchMatch
    })
  }, [prescriptions, statusFilter, searchTerm])

  if (prescriptions.length === 0) {
    return (
      <div className="w-full p-4">
        <Card className="rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 sm:p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              Prescriptions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View all prescriptions for your patients
            </p>
          </div>
          <CardContent className="py-8 text-center text-gray-600 dark:text-gray-300">
            No prescriptions found. Create a diagnosis first to issue
            prescriptions.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <Card className="rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 sm:p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            Prescriptions ({prescriptions.length})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View all prescriptions for your patients
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by prescription number or patient name"
              className="pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="dispensed">Dispensed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600 dark:text-gray-300">
              No prescriptions match your search criteria.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableHead>Prescription No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Patient
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Medications
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription: TPrescription) => (
                  <TableRow
                    key={prescription.prescription_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell>{prescription.prescription_number}</TableCell>
                    <TableCell>
                      {dayjs(prescription.prescription_date).format(
                        'MMM D, YYYY',
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {prescription.diagnosis?.patient?.first_name}{' '}
                      {prescription.diagnosis?.patient?.last_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {prescription.medications
                        ?.map((med) => med.name)
                        .join(', ') || (
                        <Button
                          variant="outline"
                          className="w-full text-blue-500"
                        >
                          Add Medications
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {prescription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedPrescription(prescription)
                            }
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:w-[500px] bg-white dark:bg-gray-900 px-6 py-6">
                          <SheetHeader>
                            <SheetTitle className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                              Prescription Details
                            </SheetTitle>
                          </SheetHeader>

                          {selectedPrescription && (
                            <div className="grid gap-4 text-sm text-gray-800 dark:text-gray-200">
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Prescription No
                                </p>
                                <p>
                                  {selectedPrescription.prescription_number}
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Date
                                </p>
                                <p>
                                  {dayjs(
                                    selectedPrescription.prescription_date,
                                  ).format('MMM D, YYYY')}
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Patient
                                </p>
                                <p>
                                  {
                                    selectedPrescription.diagnosis?.patient
                                      ?.first_name
                                  }{' '}
                                  {
                                    selectedPrescription.diagnosis?.patient
                                      ?.last_name
                                  }
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Diagnosis
                                </p>
                                <p>
                                  {
                                    selectedPrescription.diagnosis
                                      ?.diagnosis_name
                                  }
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">
                                  Medications
                                </p>
                                <div className="space-y-2">
                                  {selectedPrescription?.medications &&
                                  selectedPrescription.medications.length >
                                    0 ? (
                                    selectedPrescription.medications.map(
                                      (med) => (
                                        <div
                                          key={med.medication_id}
                                          className="p-2 bg-gray-50 dark:bg-gray-800 rounded"
                                        >
                                          <p className="font-medium">
                                            {med.name}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {med.medication_type} •{' '}
                                          </p>
                                        </div>
                                      ),
                                    )
                                  ) : (
                                    <p className="text-gray-500">
                                      No medications listed
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">
                                  Dosage Instructions
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                  {selectedPrescription.dosage_instructions?.map(
                                    (dosage, i) => (
                                      <li key={i}>{dosage}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Quantity
                                </p>
                                <p>
                                  {selectedPrescription.quantity_prescribed}
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Duration
                                </p>
                                <p>{selectedPrescription.duration_days} days</p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Frequency
                                </p>
                                <p>
                                  {selectedPrescription.frequency_per_day}x per
                                  day
                                </p>
                              </div>
                              {selectedPrescription.notes && (
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                                    Notes
                                  </p>
                                  <p>{selectedPrescription.notes}</p>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Status
                                </p>
                                <Badge variant="outline" className="capitalize">
                                  {selectedPrescription.status}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
