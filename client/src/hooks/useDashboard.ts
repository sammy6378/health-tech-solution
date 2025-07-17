
import type { TUser } from '@/types/Tuser'
import {  type TAppointment, type TDiagnosis, type TMedicalrecord, type TMedication, type TOrder, type TPayment, type TPrescription } from "@/types/api-types";
import { useDashboardData } from "./useUserHook";

interface DashboardStats {
  totalAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  totalDiagnoses: number
  totalPrescriptions: number
  activePrescriptions: number
  totalOrders: number
  pendingOrders: number
  totalMedications?: number
  totalPatients?: number
  totalPayments?: number
  totalRevenue?: number
  lowStockItems?: number
  prescriptionsChangePercent?: number
  paymentsChangePercent?: number
  ordersChangePercent?: number
  inventoryPercentage?: number
}

export interface Dashboard {
  user: TUser
  profileData: TUser
  appointments: TAppointment[]
  diagnoses: TDiagnosis[]
  prescriptions: TPrescription[]
  orders: TOrder[]
  patients?: TUser[]
  medications?: TMedication[]
  payments?: TPayment[]
  medicalRecord?: TMedicalrecord
  stats: DashboardStats
}


// Get dashboard data for the current user
export const useUserData = () => {
  const { user, data, isLoading, error } = useDashboardData()

  // Safety defaults
  const appointments: TAppointment[] = data?.appointments || []
  const prescriptions: TPrescription[] = data?.prescriptions || []
  const orders: TOrder[] = data?.orders || []

  const stats = data?.stats || {
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalDiagnoses: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
    totalOrders: 0,
    pendingOrders: 0,
  }

  return {
    user: data?.user || null,
    profileData: data?.profileData || null,
    appointments,
    diagnoses: data?.diagnoses || [],
    prescriptions,
    orders,
    payments: data?.payments || [],
    profile: data?.profileData || null,
    patients: data?.patients || [],
    Records: data?.medicalRecord ? [data.medicalRecord] : [],
    stats,

    doctors: user?.role === 'doctor' ? [user] : [],
    userInfo: user ? [user] : [],

    // Appointment-related
    totalAppointments: stats.totalAppointments || 0,
    upcomingAppointments: appointments.filter((a) => a.status === 'scheduled'),
    completedAppointments: appointments.filter((a) => a.status === 'completed'),
    cancelledAppointments: appointments.filter((a) => a.status === 'cancelled'),
    pendingAppointments: appointments.filter((a) => a.status === 'pending'),

    // Prescription-related
    totalPrescriptions: stats.totalPrescriptions || 0,
    activePrescriptions: prescriptions.filter((p) => p.status === 'active'),
    expiredPrescriptions: prescriptions.filter((p) => p.status === 'expired'),
    pendingPrescriptions: prescriptions.filter((p) => p.status === 'pending'),
    completedPrescriptions: prescriptions.filter(
      (p) => p.status === 'completed',
    ),
    cancelledPrescriptions: prescriptions.filter(
      (p) => p.status === 'cancelled',
    ),

    // Doctor-specific
    doctorPrescriptions: user?.role === 'doctor' ? prescriptions : [],
    doctorMedications:
      user?.role === 'doctor'
        ? prescriptions.flatMap((p) => p.prescriptionMedications || [])
        : [],
    myPatients: data?.patients || [],

    // Order-related
    totalOrders: stats.totalOrders || 0,
    pendingOrders: orders.filter((o) => o.payment_status === 'pending'),
    paidOrders: orders.filter((o) => o.payment_status === 'paid'),
    failedOrders: orders.filter((o) => o.payment_status === 'failed'),
    refundedOrders: orders.filter((o) => o.payment_status === 'refunded'),
    recentOrders: orders.slice(0, 5),

    // Medical records
    medicalRecords: data?.medicalRecord ? [data.medicalRecord] : [],
    totalMedicalRecords: data?.user?.medicalRecord ? 1 : 0,
    bmiRecord: data?.user?.medicalRecord?.bmi ? data.user.medicalRecord : null,

    isLoading,
    error,
  }
}


// patient
export const usePatientData = () => {
  const { data, isLoading, error } = useDashboardData()

  return {
    appointments: data?.appointments || [],
    diagnoses: data?.diagnoses || [],
    prescriptions: data?.prescriptions || [],
    orders: data?.orders || [],
    stats: data?.stats || {},
    isLoading,
    error,
  }
}

// doctor
export const useDoctorData = () => {
  const { data, user, isLoading, error } = useDashboardData()

  return {
    profile: data?.profileData || null,
    appointments: data?.appointments || [],
    diagnoses: data?.diagnoses || [],
    prescriptions: data?.prescriptions || [],
    orders: data?.orders || [],
    patients: data?.patients || [],
    stats: data?.stats || {},
    myPrescriptions: user?.role === 'doctor' ? data?.prescriptions || [] : [],
    myMedications:
      user?.role === 'doctor'
        ? data?.prescriptions?.flatMap((p) => p.prescriptionMedications || []) || []
        : [],
    isLoading,
    error,
  }
}



// pharmacy
export const usePharmacyData = () => {
  const { data, isLoading, error } = useDashboardData()

  return {
    medications: data?.medications || [],
    orders: data?.orders || [],
    prescriptions: data?.prescriptions || [],
    diagnoses: data?.diagnoses || [],
    patients: data?.patients || [],
    payments: data?.payments || [],
    stats: data?.stats || [],
    isLoading,
    error,
  }
}

