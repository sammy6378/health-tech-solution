export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
}
export interface TUser {
  first_name: string
  last_name: string
  email: string
  password: string
  role?: Role
  doctorProfile?: TDoctor
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


export enum Gender{
  FEMALE = 'female',
  MALE = 'male'
}

export interface TDoctor {
  profile_id?: string
  license_number: string
  phone_number?: string
  specialization?: string
  years_of_experience: number
  education: string
  department: string
  availability: boolean
  sex: Gender
  address: string
  consultation_fee?: number
  ratings?: number[]
  reviews?: string[]
  avatar: string
  bio?: string
}