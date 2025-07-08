
import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search,
  Pill,
  Syringe,
  SprayCan,
  Droplet,
  TestTube2,
  type LucideIcon,
} from 'lucide-react'
import { useGetMedications } from '@/hooks/useMedication'
import { StockCategory, StockType, type TMedication } from '@/types/api-types'

const Pharmacy = () => {
  const { data, isLoading } = useGetMedications()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<
    StockCategory | 'all'
  >('all')
  const [selectedType, setSelectedType] = React.useState<StockType | 'all'>(
    'all',
  )
  const [selectedMed, setSelectedMed] = React.useState<TMedication | null>(null)
    const medications = data?.data || []

  // Calculate metrics
  const metrics = {
    total: medications.length,
    categories: Object.values(StockCategory).reduce(
      (acc, category) => {
        acc[category] = medications.filter(
          (m) => m.category === category,
        ).length
        return acc
      },
      {} as Record<StockCategory, number>,
    ),
    types: Object.values(StockType).reduce(
      (acc, type) => {
        acc[type] = medications.filter((m) => m.medication_type === type).length
        return acc
      },
      {} as Record<StockType, number>,
    ),
    prescriptionRequired: medications.filter((m) => m.prescription_required)
      .length,
    lowStock: medications.filter((m) => m.stock_quantity < 10).length,
  }

  // Filter medications
  const filteredMeds = medications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || med.category === selectedCategory
    const matchesType =
      selectedType === 'all' || med.medication_type === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  const getTypeIcon = (type: StockType): LucideIcon => {
    switch (type) {
      case StockType.TABLET:
        return Pill
      case StockType.CAPSULE:
      case StockType.CAPSULE:
        return Pill
        return Syringe
      case StockType.SYRUP:
        return TestTube2
      case StockType.INHALER:
        return SprayCan
      case StockType.DROPS:
        return Droplet
      default:
        return Pill
    }
  }

  const getCategoryColor = (category: StockCategory) => {
    switch (category) {
      case StockCategory.ANTIBIOTIC:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case StockCategory.ANALGESIC:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case StockCategory.ANTIHISTAMINE:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case StockCategory.ANTACIDS:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case StockCategory.ANTIHYPERTENSIVE:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div className="w-full p-4">
      {/* Medications List */}
      <Card className="rounded-lg shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Medications</CardTitle>
              <CardDescription>
                Browse and search available medications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medications..."
                  className="pl-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Select
              value={selectedCategory}
              onValueChange={(v) =>
                setSelectedCategory(v as StockCategory | 'all')
              }
            >
              <SelectTrigger className="w-full md:w-64 dark:bg-gray-800 dark:border-gray-600">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(StockCategory).map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as StockType | 'all')}
            >
              <SelectTrigger className="w-full md:w-64 dark:bg-gray-800 dark:border-gray-600">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(StockType).map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredMeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Pill className="h-12 w-12 mb-4" />
              <p>No medications found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">
                      Manufacturer
                    </th>
                    <th className="p-3 text-left text-sm font-medium">
                      Category
                    </th>
                    <th className="p-3 text-left text-sm font-medium">Type</th>
                    <th className="p-3 text-left text-sm font-medium">
                      Dosage
                    </th>
                    <th className="p-3 text-left text-sm font-medium">Price</th>
                    <th className="p-3 text-left text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeds.map((med) => {
                    const TypeIcon = getTypeIcon(med.medication_type)
                    return (
                      <tr
                        key={med.medication_id}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3 font-medium">{med.name}</td>
                        <td className="p-3">{med.manufacturer}</td>
                        <td className="p-3">
                          <Badge className={getCategoryColor(med.category)}>
                            {med.category}
                          </Badge>
                        </td>
                        <td className="p-3 flex items-center gap-1">
                          <TypeIcon className="h-4 w-4" />
                          <span className="capitalize">
                            {med.medication_type}
                          </span>
                        </td>
                        <td className="p-3">{med.dosage}</td>
                        <td className="p-3 font-semibold">${med.unit_price}</td>
                        <td className="p-3">
                          <Sheet>
                            <SheetTrigger asChild>
                              <button
                                onClick={() => setSelectedMed(med)}
                                className="text-blue-600 cursor-pointer hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                              >
                                View
                              </button>
                            </SheetTrigger>
                            <SheetContent
                              side="right"
                              className="w-full sm:max-w-md"
                            >
                              <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                  <TypeIcon className="h-5 w-5" />
                                  {med.name}
                                </SheetTitle>
                              </SheetHeader>
                              <div className="grid gap-4 py-4">
                                <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                  {med.image ? (
                                    <img
                                      src={med.image}
                                      alt={med.name}
                                      className="object-contain w-full h-full"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                      <Pill className="h-20 w-20" />
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="text-muted-foreground">
                                      Manufacturer:
                                    </span>{' '}
                                    {med.manufacturer}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Dosage:
                                    </span>{' '}
                                    {med.dosage}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Description:
                                    </span>{' '}
                                    {med.description}
                                  </p>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Pharmacy
