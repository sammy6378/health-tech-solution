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