// import * as React from 'react'
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Separator } from '@/components/ui/separator'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Pill,
//   Calendar,
//   Clock,
//   User,
//   Search,
//   Filter,
//   Download,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Timer,
//   Stethoscope,
//   Phone,
//   Mail,
// } from 'lucide-react'
// import { PrescriptionStatus, type TPrescription } from '@/types/api-types'
// import { useAuthStore } from '@/store/store'
// import { useGetPrescriptionsByPatient } from '@/hooks/usePrescriptions'

// export default function PrescriptionsPage() {
//   const { user } = useAuthStore()
//   const userId = user?.userId || ''
//   const [searchTerm, setSearchTerm] = React.useState('')
//   const [statusFilter, setStatusFilter] = React.useState('all')
//   const { data: prescriptionsResponse } = useGetPrescriptionsByPatient(userId)
//   const prescriptions = prescriptionsResponse?.data ?? []
//   console.log('Prescriptions data:', prescriptions)

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case PrescriptionStatus.ACTIVE:
//         return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
//       case PrescriptionStatus.PENDING:
//         return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
//       case PrescriptionStatus.COMPLETED:
//         return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
//       case PrescriptionStatus.CANCELLED:
//         return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
//       default:
//         return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
//     }
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case PrescriptionStatus.ACTIVE:
//         return <CheckCircle className="w-4 h-4" />
//       case PrescriptionStatus.PENDING:
//         return <Timer className="w-4 h-4" />
//       case PrescriptionStatus.COMPLETED:
//         return <CheckCircle className="w-4 h-4" />
//       case PrescriptionStatus.CANCELLED:
//         return <XCircle className="w-4 h-4" />
//       default:
//         return <AlertCircle className="w-4 h-4" />
//     }
//   }

//   const filteredPrescriptions = prescriptions.filter((p: TPrescription) => {
//     const searchMatch =
//       // p.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) 
//       // p.diagnosis?.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
//     const statusMatch = statusFilter === 'all' || p.status === statusFilter
//     return searchMatch && statusMatch
//   })

//   const formatDate = (date: string) =>
//     new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     })

//   return (
//     <div className="container py-12">
//       <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//           My Prescriptions
//         </h1>
//         <div className="flex gap-2 w-full md:w-auto">
//           <div className="relative w-full md:w-64">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <Input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by medication, patient, or diagnosis"
//               className="pl-10"
//             />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-40">
//               <Filter className="w-4 h-4 mr-2" />
//               <SelectValue placeholder="Filter by status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All</SelectItem>
//               <SelectItem value={PrescriptionStatus.ACTIVE}>Active</SelectItem>
//               <SelectItem value={PrescriptionStatus.PENDING}>
//                 Pending
//               </SelectItem>
//               <SelectItem value={PrescriptionStatus.COMPLETED}>
//                 Completed
//               </SelectItem>
//               <SelectItem value={PrescriptionStatus.CANCELLED}>
//                 Cancelled
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {filteredPrescriptions.length === 0 ? (
//         <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
//           <p className="text-lg font-medium">No prescriptions found.</p>
//           <p className="text-sm">Try adjusting your search or filter.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredPrescriptions.map((prescription) => (
//             <Card
//               key={prescription.medication_id}
//               className="relative overflow-hidden border shadow-md rounded-xl dark:bg-gray-800 dark:border-gray-700"
//             >
//               <div
//                 className={`absolute top-0 left-0 w-1 h-full ${
//                   getStatusColor(prescription.status).split(' ')[0]
//                 }`}
//               />
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="text-lg">
//                     {prescription.medication_name}
//                   </CardTitle>
//                   <Badge
//                     className={`${getStatusColor(prescription.status)} flex items-center gap-1`}
//                   >
//                     {getStatusIcon(prescription.status)}
//                     {prescription.status}
//                   </Badge>
//                 </div>
//                 <CardDescription>
//                   {prescription.diagnosis?.diagnosis || 'No diagnosis info'}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                   <User className="w-4 h-4" />{' '}
//                   {prescription.patient?.first_name || 'N/A'}
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                   <Calendar className="w-4 h-4" />{' '}
//                   {formatDate(prescription.prescription_date)}
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
//                   <Clock className="w-4 h-4" /> {prescription.frequency_per_day}
//                   x per day
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


import { useState } from 'react'
import { useAuthStore } from '@/store/store'
import { useGetPrescriptionsByPatient } from '@/hooks/usePrescriptions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Pill,
  Calendar,
  ClipboardList,
  User,
  FileText,
  Info,
  Search,
} from 'lucide-react'
import { type TPrescription, PrescriptionStatus } from '@/types/api-types'

export default function PrescriptionsPage() {
  const { user } = useAuthStore()
  const userId = user?.userId || ''
  const { data: prescriptionsResponse } = useGetPrescriptionsByPatient(userId)
  const prescriptions = prescriptionsResponse?.data ?? []
  console.log('Prescriptions data:', prescriptions)

  const [searchTerm, setSearchTerm] = useState('')

  // const filteredPrescriptions = prescriptions.filter(
  //   (p) =>
  //     p.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     p.diagnosis?.diagnosis
  //       ?.toLowerCase()
  //       .includes(searchTerm.toLowerCase())
  // )

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const getStatusColor = (status: PrescriptionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="container py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        My Prescriptions
      </h1>

      {/* Search bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by medication, diagnosis, or doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
          No prescriptions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((prescription: TPrescription) => (
            <Card
              key={prescription.medication_id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      {prescription.medication_name}
                    </CardTitle>
                  </div>
                  <Badge
                    className={`${getStatusColor(prescription.status)} text-xs px-2 py-1`}
                  >
                    {prescription.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Dr. {prescription.doctor?.first_name}{' '}
                  {prescription.doctor?.last_name}
                </p>
              </CardHeader>

              <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Prescription #:</span>{' '}
                  {prescription.prescription_number}
                </div>

                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Diagnosis:</span>{' '}
                  {prescription.diagnosis?.diagnosis || 'N/A'}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium">Dosage</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                      {prescription.dosage_instructions.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Quantity</p>
                    <p>{prescription.quantity_prescribed} tablets</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prescription.frequency_per_day}x per day for{' '}
                      {prescription.duration_days} days
                    </p>
                  </div>
                </div>

                {prescription.notes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-1" />
                    <span>{prescription.notes}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm pt-3 border-t dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      Prescribed: {formatDate(prescription.prescription_date)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
