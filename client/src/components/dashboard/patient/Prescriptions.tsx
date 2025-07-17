import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pill,
  Calendar,
  ClipboardList,
  User,
  FileText,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { formatDate } from '@/types/api-types'
import { useUserData } from '@/hooks/useDashboard'
import { useGetMedications } from '@/hooks/useMedication'
import { useCartStore } from '@/store/cart/add'

export default function PrescriptionsPage() {
  const { prescriptions } = useUserData()
  const { data: pharmacyData } = useGetMedications()
  const pharmacyMeds = pharmacyData?.data ?? []
  const { addToCart } = useCartStore()
  const [searchTerm, setSearchTerm] = useState('')

  console.log('prescriptions', prescriptions)

const filteredPrescriptions = prescriptions.filter((p) => {
  const name = p?.diagnosis?.diagnosis_name;
  return name?.toLowerCase().includes(searchTerm.toLowerCase());
});

console.log('filteredPrescriptions', filteredPrescriptions)

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
        <div className="text-center text-gray-500 dark:text-gray-400 py-20">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-lg font-medium">No Prescriptions found</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrescriptions.map((prescription) => {
            const matchedMeds = prescription.prescriptionMedications?.filter(
              (med) =>
                pharmacyMeds.some(
                  (pm) =>
                    pm.name?.toLowerCase() === med.medication.name.toLowerCase(),
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
                        {prescription.diagnosis?.diagnosis_name ||
                          'Untitled Diagnosis'}
                      </CardTitle>
                    </div>
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
                    {prescription.prescription_number || 'N/A'}
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
                      {prescription.prescriptionMedications?.map((med) => (
                        <li key={`${med.medication_name}-${med.id}`}>
                          {med.medication.name}
                          <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              Dosage:
                              <ul className="list-[circle] list-inside">
                                {med.dosage_instructions?.map((inst, idx) => (
                                  <li key={idx}>{inst}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              Quantity: {med.quantity_prescribed} tablets
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {med.frequency_per_day}x per day for{' '}
                              {med.duration_days} days
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between text-sm pt-3 border-t dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        Prescribed:{' '}
                        {prescription.prescription_date
                          ? formatDate(prescription.prescription_date)
                          : 'N/A'}
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
                          <li key={med.medication.name}>
                            {med.medication.name}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => {
                          matchedMeds.forEach((med) => {
                            const found = pharmacyMeds.find(
                              (pm) =>
                                pm.name.toLowerCase() ===
                                med.medication.name.toLowerCase(),
                            )
                            if (found) {
                              addToCart(found, med.quantity_prescribed)
                            }
                          })
                        }}
                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded-md text-sm"
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
