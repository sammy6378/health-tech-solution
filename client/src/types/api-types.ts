import type { TUser } from './Tuser'

// dates
export const formatDate = (date: Date | string) => {
  const parsedDate = new Date(date)
  if (!date) return 'No date'
  if (isNaN(parsedDate.getTime())) return 'Invalid date'

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// currency
export const formatCurrency = (amount?: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!numAmount || isNaN(numAmount)) return 'KES 0.00'
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(numAmount)
}

// time
export const formatTime = (time: string) => {
  if (!time) return 'No time'
  const [hours, minutes] = time.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 || 12 // Convert to 12-hour format
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

// diagnosis
export interface TDiagnosis {
  diagnosis_id?: string
  diagnosis_name: string
  treatment_plan: string
  diagnosis_date: Date
  notes?: string[]
  docs?: string[]
  tests?: string[]
  allergies?: string[]
  symptoms?: string[]
  created_at?: Date
  patient?: TUser
  doctor?: TUser
  prescriptions?: TPrescription[]
  appointment?: TAppointment
  appointment_id?: string
  prescription_ids?: string[]
}

// prescriptions
export enum PrescriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export interface TPrescription {
  prescription_id: string
  prescription_number: string
  prescription_date: Date
  duration_days?: number
  frequency_per_day?: number
  quantity_prescribed: number
  quantity_dispensed?: number
  unit_price?: number
  total_price?: number
  dosage_instructions: string[]
  notes?: string
  status: PrescriptionStatus
  created_at?: string
  diagnosis?: TDiagnosis
  doctor?: TUser
  patient?: TUser
  diagnosis_id?: string
  patient_id?: string
  doctor_id?: string
  medications?: TMedication[]
}

// appointments
export enum AppointmentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ConsultationType {
  IN_PERSON = 'in-person',
  VIRTUAL = 'virtual',
}

export interface TAppointment {
  appointment_id?: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  start_time?: string
  end_time?: string
  time_slots?: string[]
  consultation_type: ConsultationType
  status?: AppointmentStatus
  meeting_link?: string
  start_url?: string
  join_url?: string
  zoom_meeting_id?: string
  reason: string
  notes?: string
  patient?: TUser
  doctor?: TUser
  diagnosis?: TDiagnosis[]
  created_at?: Date
  updated_at?: Date
  doctor_id?: string
  patient_id: string
}

// medicines
export enum StockCategory {
  ANTIBIOTIC = 'Antibiotic',
  ANALGESIC = 'Analgesic',
  ANTIHISTAMINE = 'Antihistamine',
  ANTACIDS = 'Antacids',
  ANTIHYPERTENSIVE = 'Antihypertensive',
  ANTIDEPRESSANT = 'Antidepressant',
  ANTIANXIETY = 'Antianxiety',
  ANTIFUNGAL = 'Antifungal',
  ANTIINFLAMMATORY = 'Anti-inflammatory',
  ANTIVIRAL = 'Antiviral',
  PAINRELIEVER = 'Pain Reliever',
  OTHER = 'Other',
}

export enum StockType {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
  CREAM = 'Cream',
  OINTMENT = 'Ointment',
  PATCH = 'Patch',
  INHALER = 'Inhaler',
  DROPS = 'Drops',
  SUPPOSITORY = 'Suppository',
  OTHER = 'Other',
}

export interface TMedication {
  medication_id?: string
  name: string
  description?: string
  dosage: string
  side_effects?: string[]
  manufacturer: string
  expiration_date: Date
  category: StockCategory
  unit_price: number
  medication_code: string
  medication_type: StockType
  manufacturer_contact?: string
  image?: string
  stock_quantity: number
  total_price?: number // Calculated field
  prescription_required: boolean
  created_at?: string
  updated_at?: string
}

// orders
export enum DeliveryMethod {
  HOME_DELIVERY = 'home_delivery',
  PICKUP = 'pickup',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  MOBILE_MONEY = 'mobile_money',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface TOrder {
  order_id?: string
  order_number?: string
  total_amount?: number
  order_date?: Date
  delivery_address: string
  delivery_method: DeliveryMethod
  delivery_time: string
  estimated_delivery?: string
  delivery_status?: DeliveryStatus
  payment_method: PaymentMethod
  payment_status?: PaymentStatus
  notes?: string
  created_at?: Date
  updated_at?: Date
  prescription: TPrescription
  payment?: TPayment
  orderMedications: TOrderMedication[]
  patient?: TUser
  patient_id?: string
}

// order medications
export interface TOrderMedication {
  id?: string
  quantity: number
  unit_price: number
  total_amount: number
  medication_id: string
  created_at?: Date
  medication?: TMedication
}

// medical records
export interface TMedicalrecord {
  record_id?: string
  patient_id?: string
  record_date?: Date
  description?: string
  diagnosis?: string
  treatment_plan?: string
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  weight?: number
  height?: number
  bmi?: number
  allergies?: string[]
  notes?: string
  docs?: string[]
  patient?: TUser
}



export interface TPayment {
  payment_id?: string
  order_id?: string
  order_number: string
  amount: number
  payment_date: Date
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  transaction_id?: string
  created_at?: Date
  updated_at?: Date
}