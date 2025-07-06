import type { TUser } from './Tuser'

export const formatDate = (date: Date | string) => {
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return 'Invalid date'

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
  medication_id: string
  medication_name: string
  patient_id: string
  doctor_id: string
  prescription_date: string
  expiry_date: string
  prescription_number: string
  quantity_prescribed: number
  dosage_instructions: string[]
  status: PrescriptionStatus
  duration_days?: number
  frequency_per_day?: number
  notes?: string
  users?: TUser
  createdAt?: string
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
  user?: TUser
  doctor?: TUser
  appointment_date: Date
  appointment_time: string
  duration_minutes: number
  consultation_type: ConsultationType
  status?: AppointmentStatus
  notes?: string
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
  image: string
  stock_quantity: number
  total_price?: number // Calculated field
  prescription_required: boolean
  createdAt?: string
  updatedAt?: string
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
  prescription_id: string
  delivery_address: string
  delivery_method: DeliveryMethod
  delivery_status?: DeliveryStatus
  payment_status?: PaymentStatus // Optional, can be set to PENDING by default
  estimated_delivery?: string // Optional, can be calculated based on delivery method
  amount?: number // Optional, can be calculated based on medications in the order
  order_number?: string // Optional, can be generated automatically
  order_date?: string // Optional, can be set to current date if not provided
  order_id?: string // Optional, can be generated automatically
  delivery_time: string
  payment_method: PaymentMethod
  notes?: string
  created_at?: Date
}
