'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pill,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Stethoscope,
  Phone,
  Mail,
} from 'lucide-react'

enum PrescriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Mock prescriptions data
const prescriptions = [
  {
    id: 1,
    prescription_date: '2025-06-28',
    prescription_number: 'RX-2025-001234',
    medication_name: 'Lisinopril',
    quantity_prescribed: 30,
    dosage_instructions: [
      'Take 10mg once daily',
      'Take with or without food',
      'Take at the same time each day',
    ],
    status: PrescriptionStatus.ACTIVE,
    duration_days: 30,
    frequency_per_day: 1,
    notes:
      'Monitor blood pressure weekly. Contact doctor if experiencing dizziness or dry cough.',
    doctor: 'Dr. Sarah Johnson',
    doctor_specialty: 'Cardiology',
    doctor_phone: '+1 (555) 123-4567',
    doctor_email: 'sarah.johnson@medcenter.com',
    pharmacy: 'CVS Pharmacy - Main St',
    refills_remaining: 2,
    expiry_date: '2025-12-28',
    condition: 'Hypertension',
  },
  {
    id: 2,
    prescription_date: '2025-06-25',
    prescription_number: 'RX-2025-001235',
    medication_name: 'Metformin',
    quantity_prescribed: 60,
    dosage_instructions: [
      'Take 500mg twice daily',
      'Take with meals',
      'Do not crush or chew tablets',
    ],
    status: PrescriptionStatus.ACTIVE,
    duration_days: 60,
    frequency_per_day: 2,
    notes:
      'Regular blood sugar monitoring required. May cause mild stomach upset initially.',
    doctor: 'Dr. Michael Chen',
    doctor_specialty: 'Endocrinology',
    doctor_phone: '+1 (555) 234-5678',
    doctor_email: 'michael.chen@diabetes.com',
    pharmacy: 'Walgreens - Oak Avenue',
    refills_remaining: 5,
    expiry_date: '2026-01-25',
    condition: 'Type 2 Diabetes',
  },
  {
    id: 3,
    prescription_date: '2025-06-20',
    prescription_number: 'RX-2025-001236',
    medication_name: 'Amoxicillin',
    quantity_prescribed: 21,
    dosage_instructions: [
      'Take 500mg three times daily',
      'Take with food',
      'Complete full course even if feeling better',
    ],
    status: PrescriptionStatus.COMPLETED,
    duration_days: 7,
    frequency_per_day: 3,
    notes:
      'Antibiotic for respiratory infection. Avoid alcohol during treatment.',
    doctor: 'Dr. Emily Rodriguez',
    doctor_specialty: 'Family Medicine',
    doctor_phone: '+1 (555) 345-6789',
    doctor_email: 'emily.rodriguez@familymed.com',
    pharmacy: 'Rite Aid - Downtown',
    refills_remaining: 0,
    expiry_date: '2025-06-27',
    condition: 'Upper Respiratory Infection',
  },
  {
    id: 4,
    prescription_date: '2025-06-15',
    prescription_number: 'RX-2025-001237',
    medication_name: 'Ibuprofen',
    quantity_prescribed: 60,
    dosage_instructions: [
      'Take 400mg every 6-8 hours as needed',
      'Do not exceed 1200mg per day',
      'Take with food or milk',
    ],
    status: PrescriptionStatus.PENDING,
    duration_days: 14,
    frequency_per_day: 3,
    notes:
      'For pain management post-surgery. Stop if experiencing stomach pain.',
    doctor: 'Dr. James Wilson',
    doctor_specialty: 'Orthopedics',
    doctor_phone: '+1 (555) 456-7890',
    doctor_email: 'james.wilson@orthocenter.com',
    pharmacy: 'CVS Pharmacy - Main St',
    refills_remaining: 0,
    expiry_date: '2025-12-15',
    condition: 'Post-operative Pain',
  },
]

export default function PrescriptionsPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case PrescriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case PrescriptionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case PrescriptionStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case PrescriptionStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status:string) => {
    switch (status) {
      case PrescriptionStatus.ACTIVE:
        return <CheckCircle className="w-4 h-4" />
      case PrescriptionStatus.PENDING:
        return <Timer className="w-4 h-4" />
      case PrescriptionStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />
      case PrescriptionStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch =
      prescription.medication_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.condition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || prescription.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString:string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isExpiringSoon = (expiryDate:string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isExpired = (expiryDate:string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    return expiry < today
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 `}
    >
      <div className="min-h-screen">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Prescriptions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and track your medication prescriptions
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by medication, doctor, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 dark:bg-gray-800 dark:border-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prescriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prescriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPrescriptions.map((prescription) => (
              <Sheet key={prescription.id}>
                <SheetTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 relative overflow-hidden">
                    {/* Status indicator strip */}
                    <div
                      className={`absolute top-0 left-0 w-1 h-full ${
                        prescription.status === PrescriptionStatus.ACTIVE
                          ? 'bg-green-500'
                          : prescription.status === PrescriptionStatus.PENDING
                            ? 'bg-yellow-500'
                            : prescription.status ===
                                PrescriptionStatus.COMPLETED
                              ? 'bg-blue-500'
                              : 'bg-red-500'
                      }`}
                    />

                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <CardTitle className="text-lg dark:text-white">
                            {prescription.medication_name}
                          </CardTitle>
                        </div>
                        <Badge
                          className={`${getStatusColor(prescription.status)} flex items-center gap-1`}
                        >
                          {getStatusIcon(prescription.status)}
                          {prescription.status}
                        </Badge>
                      </div>
                      <CardDescription className="dark:text-gray-400">
                        {prescription.condition}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        {prescription.doctor}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        Prescribed: {formatDate(prescription.prescription_date)}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {prescription.frequency_per_day}x daily for{' '}
                        {prescription.duration_days} days
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {prescription.quantity_prescribed}
                        </span>
                        {prescription.refills_remaining > 0 && (
                          <span className="text-sm text-green-600 dark:text-green-400">
                            {prescription.refills_remaining} refills left
                          </span>
                        )}
                      </div>

                      {/* Warning indicators */}
                      {isExpired(prescription.expiry_date) && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          <AlertCircle className="w-4 h-4" />
                          Expired
                        </div>
                      )}

                      {isExpiringSoon(prescription.expiry_date) &&
                        !isExpired(prescription.expiry_date) && (
                          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            Expires soon
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </SheetTrigger>

                <SheetContent className="w-full sm:max-w-lg dark:bg-gray-800 dark:border-gray-700 overflow-y-auto p-3">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 dark:text-white">
                      <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {prescription.medication_name}
                    </SheetTitle>
                    <SheetDescription className="dark:text-gray-400">
                      Prescription #{prescription.prescription_number}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    {/* Status and Basic Info */}
                    <div className="flex justify-between items-center">
                      <Badge
                        className={`${getStatusColor(prescription.status)} flex items-center gap-1 px-3 py-1`}
                      >
                        {getStatusIcon(prescription.status)}
                        {prescription.status.charAt(0).toUpperCase() +
                          prescription.status.slice(1)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-gray-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Medication Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Medication Details
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Quantity
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prescription.quantity_prescribed} tablets
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Duration
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prescription.duration_days} days
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Frequency
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prescription.frequency_per_day}x daily
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Refills
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prescription.refills_remaining} remaining
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Dosage Instructions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Dosage Instructions
                      </h3>
                      <div className="space-y-2">
                        {prescription.dosage_instructions.map(
                          (instruction, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {instruction}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Doctor Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Prescribing Doctor
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {prescription.doctor}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.doctor_specialty}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.doctor_phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.doctor_email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    {/* Dates and Pharmacy */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Prescribed Date
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(prescription.prescription_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Expires
                          </p>
                          <p
                            className={`text-sm ${
                              isExpired(prescription.expiry_date)
                                ? 'text-red-600 dark:text-red-400'
                                : isExpiringSoon(prescription.expiry_date)
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {formatDate(prescription.expiry_date)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Pharmacy
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {prescription.pharmacy}
                        </p>
                      </div>
                    </div>

                    {prescription.notes && (
                      <>
                        <Separator className="dark:bg-gray-700" />
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Additional Notes
                          </h3>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {prescription.notes}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>

          {/* Empty State */}
          {filteredPrescriptions.length === 0 && (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No prescriptions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your prescriptions will appear here when available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
