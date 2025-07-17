import { useState, useMemo } from 'react'
import { useDoctorData } from '@/hooks/useDashboard'
import { format } from 'date-fns'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Search } from 'lucide-react'
import type { TDiagnosis } from '@/types/api-types'
import { Link } from '@tanstack/react-router'
import PrescriptionFormSheet from '@/components/modals/PrescriptionModal'

const DiagnosesTable = () => {
  const { diagnoses, error } = useDoctorData()
  console.log('diagnoses', diagnoses)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDiagnoses = useMemo(() => {
    if (!diagnoses) return []
    return diagnoses.filter((diagnosis: TDiagnosis) => {
      const searchMatch = searchTerm
        ? diagnosis.diagnosis_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          diagnosis.treatment_plan
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (diagnosis.patient?.first_name &&
            diagnosis.patient.last_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
        : true

      return searchMatch
    })
  }, [diagnoses, searchTerm])

  if (error) {
    return (
      <div className="w-full p-4">
        <Card className="rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 sm:p-6 md:p-8">
          <CardContent className="py-8 text-center text-red-500">
            Failed to load diagnoses
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!diagnoses || diagnoses.length === 0) {
    return (
      <div className="w-full p-4">
        <Card className="rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 sm:p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              Diagnoses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View all diagnoses for your patients
            </p>
          </div>
          <CardContent className="py-8 text-center text-gray-600 dark:text-gray-300">
            No diagnoses found. Create a diagnosis to get started.
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
            Diagnoses ({diagnoses.length})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View all diagnoses for your patients
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by diagnosis name, treatment plan, or patient"
              className="pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredDiagnoses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600 dark:text-gray-300">
              No diagnoses match your search criteria.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableHead>Diagnosis</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Treatment Plan
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Patient
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Prescriptions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiagnoses.map((diagnosis: TDiagnosis) => (
                  <TableRow
                    key={diagnosis.diagnosis_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell className="font-medium">
                      {diagnosis.diagnosis_name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {diagnosis.treatment_plan}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {`${diagnosis.patient?.first_name} ${diagnosis.patient?.last_name}` ||
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      {diagnosis.diagnosis_date
                        ? format(
                            new Date(diagnosis.diagnosis_date),
                            'MMM d, yyyy',
                          )
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {diagnosis.prescriptions &&
                      diagnosis.prescriptions.length > 0 ? (
                        <div className="flex flex-col space-y-1">
                          {diagnosis.prescriptions.map((prescription, idx) => (
                            <Link
                              key={idx}
                              to="/dashboard/doctor/prescriptions"
                              className="text-sm text-gray-700 dark:text-gray-300"
                            >
                              {prescription.prescription_number}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="link"
                              className="text-blue-500 p-0 h-auto cursor-pointer"
                              onClick={() => setSelectedDiagnosis(diagnosis)}
                            >
                              Add Prescription
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:w-[500px] bg-white dark:bg-gray-900 p-6 overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle className="text-lg cursor-pointer font-semibold text-gray-800 dark:text-white mb-4">
                                Add Prescription
                              </SheetTitle>
                            </SheetHeader>
                            {selectedDiagnosis && (
                              <PrescriptionFormSheet
                                diagnosisId={selectedDiagnosis.diagnosis_id}
                                onSuccess={() => setSelectedDiagnosis(null)}
                              />
                            )}
                          </SheetContent>
                        </Sheet>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setSelectedDiagnosis(diagnosis)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:w-[500px] bg-white dark:bg-gray-900 px-6 py-6">
                          <SheetHeader>
                            <SheetTitle className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                              Diagnosis Details
                            </SheetTitle>
                          </SheetHeader>

                          {selectedDiagnosis && (
                            <div className="grid gap-4 text-sm text-gray-800 dark:text-gray-200">
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Diagnosis
                                </p>
                                <p className="font-medium text-right">
                                  {selectedDiagnosis.diagnosis_name}
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Patient
                                </p>
                                <p>
                                  {' '}
                                  {`${selectedDiagnosis.patient?.first_name} ${selectedDiagnosis.patient?.last_name}` ||
                                    'N/A'}
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Date
                                </p>
                                <p>
                                  {selectedDiagnosis.diagnosis_date
                                    ? format(
                                        new Date(
                                          selectedDiagnosis.diagnosis_date,
                                        ),
                                        'PPP',
                                      )
                                    : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">
                                  Treatment Plan
                                </p>
                                <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  {selectedDiagnosis.treatment_plan}
                                </p>
                              </div>

                              <DetailList
                                title="Notes"
                                items={selectedDiagnosis.notes}
                              />
                              <DetailList
                                title="Symptoms"
                                items={selectedDiagnosis.symptoms}
                              />
                              <DetailList
                                title="Tests"
                                items={selectedDiagnosis.tests}
                              />
                              <DetailList
                                title="Allergies"
                                items={selectedDiagnosis.allergies}
                              />
                              <DetailList
                                title="Documents"
                                items={selectedDiagnosis.docs}
                              />

                              <div className="flex justify-between">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Created At
                                </p>
                                <p>
                                  {selectedDiagnosis.created_at
                                    ? format(
                                        new Date(selectedDiagnosis.created_at),
                                        'PPpp',
                                      )
                                    : 'Unknown'}
                                </p>
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

const DetailList = ({ title, items }: { title: string; items?: string[] }) => {
  if (!items || items.length === 0) return null

  return (
    <div className="mb-3">
      <p className="text-gray-500 dark:text-gray-400 mb-2">{title}</p>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="text-sm">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DiagnosesTable
