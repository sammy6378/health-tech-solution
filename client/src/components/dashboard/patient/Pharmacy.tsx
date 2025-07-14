import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Pill,
  SprayCan,
  Droplet,
  TestTube2,
  type LucideIcon,
} from 'lucide-react'
import { useGetMedications } from '@/hooks/useMedication'
import {
  StockCategory,
  StockType,
} from '@/types/api-types'
import { useCartStore } from '@/store/cart/add'

const Pharmacy = () => {
  const { data, isLoading } = useGetMedications()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<
    StockCategory | 'all'
  >('all')
  const [selectedType, setSelectedType] = React.useState<StockType | 'all'>(
    'all',
  )
  const medications = data?.data || []
  const { addToCart } = useCartStore()

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
      case StockType.CAPSULE:
        return Pill
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
      <Card className="rounded-xl shadow-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold">
                Medications
              </CardTitle>
              <CardDescription>
                Browse and search available medications
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medications..."
                className="pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select
              value={selectedCategory}
              onValueChange={(v) =>
                setSelectedCategory(v as StockCategory | 'all')
              }
            >
              <SelectTrigger className="w-full md:w-64 dark:bg-gray-800 dark:border-gray-700">
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
              <SelectTrigger className="w-full md:w-64 dark:bg-gray-800 dark:border-gray-700">
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
          ) : filteredMeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Pill className="h-12 w-12 mb-4" />
              <p>No medications found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeds.map((med) => {
                const TypeIcon = getTypeIcon(med.medication_type)
                return (
                  <Card
                    key={med.medication_id}
                    className="bg-white p-0 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    <div className="h-35 w-full flex items-center justify-center overflow-hidden">
                      <img
                        src={med.image || '/placeholder.jpg'}
                        alt={med.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-sm font-semibold">
                            {med.name}
                          </CardTitle>
                        </div>
                        <Badge
                          className={`text-xs ${getCategoryColor(med.category)}`}
                        >
                          {med.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {med.description || 'No description'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Dosage:</span>{' '}
                        {med.dosage}
                      </p>
        
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-green-600 font-bold dark:text-green-400">
                          KES {med.unit_price}
                        </p>
                        <button
                          onClick={() => addToCart(med)}
                          className="px-3 py-1 text-sm border dark:border-gray-700 cursor-pointer text-white rounded-lg"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Pharmacy
