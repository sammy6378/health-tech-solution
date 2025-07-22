import { useDoctorData } from '@/hooks/useDashboard'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  User2,
  Mail,
  Phone,
  FileText,
  Search,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { TUser } from '@/types/Tuser'

export default function DoctorPatientsPage() {
  const { patients } = useDoctorData()
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  console.log('Patients:', patients)

  const filteredPatients = patients.filter((patient) => {
    const matchName =
      patient?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      patient?.last_name?.toLowerCase().includes(search.toLowerCase())
    const matchGender = genderFilter
      ? patient?.patientProfile?.sex === genderFilter
      : true

    return matchName && matchGender 
  })

  return (
    <div className="w-full p-4">
      <Card className="rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 sm:p-6 md:p-8 ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              My Patients
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Patients you have treated and prescribed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              onChange={(e) => setGenderFilter(e.target.value)}
              value={genderFilter}
              className="rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
              className="rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <Card className="rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <CardContent className="py-8 text-center text-gray-600 dark:text-gray-300">
              No patients found matching your criteria.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Gender</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient: TUser) => (
                  <TableRow
                    key={patient.user_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell>
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {patient.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.patientProfile?.phone_number && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4" />
                          {patient.patientProfile.phone_number}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {patient.patientProfile?.sex || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                          >
                            <User2 className="h-4 w-4 mr-2" />
                            Profile
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:w-[500px] px-6 py-6 bg-white dark:bg-gray-900">
                          <SheetHeader>
                            <SheetTitle className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                              Patient Profile
                            </SheetTitle>
                          </SheetHeader>

                          <div className="grid gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                                <User2 className="h-8 w-8 text-blue-600 dark:text-gray-300" />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                                  {patient.first_name} {patient.last_name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {patient.email}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-200">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">
                                  Gender
                                </p>
                                <p className="capitalize">
                                  {patient.patientProfile?.sex || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">
                                  Phone
                                </p>
                                <p>
                                  {patient.patientProfile?.phone_number ||
                                    'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">
                                  Date of Birth
                                </p>
                                <p>
                                  {patient.patientProfile?.date_of_birth
                                    ? new Date(
                                        patient.patientProfile.date_of_birth,
                                      ).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">
                                  Age
                                </p>
                                <p>
                                  {patient.patientProfile?.age || 'N/A'} years
                                </p>
                              </div>
                            </div>

                            <div className="text-sm text-gray-800 dark:text-gray-200">
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Address
                              </p>
                              <p className="leading-tight">
                                {[
                                  patient.patientProfile?.address,
                                  patient.patientProfile?.city,
                                  patient.patientProfile?.state,
                                  patient.patientProfile?.postal_code,
                                ]
                                  .filter(Boolean)
                                  .join(', ') || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>

                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            className="cursor-pointer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Records
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:w-[600px] px-6 py-6 bg-white dark:bg-gray-900">
                          <SheetHeader>
                            <SheetTitle className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                              Medical Records
                            </SheetTitle>
                          </SheetHeader>

                          <div className="py-4">
                            {patient.medicalRecord ? (
                              <Card className="bg-gray-50 dark:bg-gray-800">
                                <CardHeader>
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-md font-medium text-gray-800 dark:text-white">
                                      {patient.medicalRecord.record_date
                                        ? new Date(
                                            patient.medicalRecord.record_date,
                                          ).toLocaleDateString()
                                        : 'No date'}
                                    </CardTitle>
                                    <Badge variant="outline">
                                      {patient.medicalRecord.diagnosis ||
                                        'No diagnosis'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-800 dark:text-gray-200 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Blood Pressure
                                      </p>
                                      <p>
                                        {patient.medicalRecord.blood_pressure ||
                                          'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Heart Rate
                                      </p>
                                      <p>
                                        {patient.medicalRecord.heart_rate ||
                                          'N/A'}{' '}
                                        bpm
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Temperature
                                      </p>
                                      <p>
                                        {patient.medicalRecord.temperature ||
                                          'N/A'}{' '}
                                        °C
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Weight
                                      </p>
                                      <p>
                                        {patient.medicalRecord.weight || 'N/A'}{' '}
                                        kg
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Height
                                      </p>
                                      <p>
                                        {patient.medicalRecord.height || 'N/A'}{' '}
                                        cm
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        BMI
                                      </p>
                                      <p>
                                        {patient.medicalRecord.bmi || 'N/A'}{' '}
                                        kg/m²
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">
                                      Treatment Plan
                                    </p>
                                    <p>
                                      {patient.medicalRecord.treatment_plan ||
                                        'N/A'}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No medical records found for this patient.
                              </div>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
