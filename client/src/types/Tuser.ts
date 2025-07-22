import type { TAppointment, TDiagnosis, TMedicalrecord, TOrder, TPrescription } from "./api-types"

export enum Role {
  PATIENT = 'patient',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}
export interface TUser {
  user_id?: string
  first_name?: string
  last_name?: string
  email?: string
  created_at?: Date
  role?: Role
  password?: string
  patientProfile?: TPatient
  doctorProfile?: TDoctor
  medicalRecord?: TMedicalrecord
  appointments?: TAppointment[]
  patientDiagnoses?: TDiagnosis[]
  doctorDiagnoses?: TDiagnosis[]
  doctorAppointments?: TAppointment[]
  pharmacies?: TPharmacy[]
  prescriptions?: TPrescription[]
  orders?: TOrder[]
}

export interface TRegister {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface TRegisterResponse {
  success: boolean
  message: string
  data: {
    user_id: string
    full_name: string
    username: string
    email: string
    phone_number: string
    role: string
  }
}



export interface TDoctor {
  profile_id?: string
  user_id?: string
  license_number: string
  phone_number?: string
  specialization?: string
  years_of_experience: number
  education: string
  department: string
  availability: boolean
  sex?: Gender
  address: string
  consultation_fee?: number
  ratings?: number[]
  reviews?: string[]
  days?: string[]
  start_time?: string
  end_time?: string
  avatar?: string
  bio?: string
  created_at?: Date
  user?: TUser
}


export interface TPharmacy {
  pharmacy_id?: string
  business_name: string
  address: string
  phone_number: string
  description?: string
  license_number: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  image?: string
  opening_hours?: string
  website?: string
  closing_hours?: string
  created_at?: Date
}

export interface TPatient {
  profile_id?: string
  user_id?: string
  phone_number: string
  address: string
  sex?: Gender
  date_of_birth?: Date
  age: number
  city?: string
  state?: string
  country?: string
  postal_code?: string
  avatar?: string
  created_at?: Date
  patient?: TUser
}