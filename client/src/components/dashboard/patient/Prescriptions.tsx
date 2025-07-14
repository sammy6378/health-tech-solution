import { useState } from 'react'
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
import {
  formatDate,
  PrescriptionStatus,
} from '@/types/api-types'
import { useUserData } from '@/hooks/useDashboard'
import { useGetMedications } from '@/hooks/useMedication'
import { useCartStore } from '@/store/cart/add'
import { toast } from 'sonner'

export default function PrescriptionsPage() {
  const { prescriptions } = useUserData()
  console.log('Prescriptions:', prescriptions) 
  const { data: pharmacyData } = useGetMedications()
  const pharmacyMeds = pharmacyData?.data ?? []
  const { addToCart } = useCartStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPrescriptions = prescriptions.filter((p) =>
    p.diagnosis?.diagnosis_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

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
          {filteredPrescriptions.map((prescription) => {
            const matchedMeds = prescription.medications?.filter((med) =>
              pharmacyMeds.some(
                (pm) => pm.name.toLowerCase() === med.name.toLowerCase(),
              ),
            )

            return (
              <Card
                key={prescription.prescription_id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {prescription.diagnosis?.diagnosis_name}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`${getStatusColor(
                        prescription.status,
                      )} text-xs px-2 py-1`}
                    >
                      {prescription.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Dr. {prescription.diagnosis?.doctor?.first_name}{' '}
                    {prescription.diagnosis?.doctor?.last_name}
                  </p>
                </CardHeader>

                <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">
                      Prescription Order:
                    </span>{' '}
                    {prescription.prescription_number}
                  </div>

                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Diagnosis:</span>{' '}
                    {prescription.diagnosis?.diagnosis_name || 'N/A'}
                  </div>

                  {/* medications */}
                  <div>
                    <span className="font-medium">Medications:</span>
                    <ul className="list-disc list-inside mt-1">
                      {prescription.medications?.map((med) => (
                        <li key={med.name}>{med.name}</li>
                      ))}
                    </ul>
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

                  {/* ✅ Direct Order Card */}
                  {matchedMeds && matchedMeds.length > 0 && (
                    <div className="border mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/10">
                      <p className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        Found {matchedMeds.length} medication
                        {matchedMeds.length > 1 ? 's' : ''} in our pharmacy
                      </p>
                      <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 mb-3">
                        {matchedMeds.map((med) => (
                          <li key={med.name}>{med.name}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => {
                          matchedMeds.forEach((med) => {
                            const found = pharmacyMeds.find(
                              (pm) =>
                                pm.name.toLowerCase() ===
                                med.name.toLowerCase(),
                            )
                            if (found) {
                              addToCart(found)
                            }
                          })
                          toast.success('Prescription meds added to cart!')
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Create Order Now
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
