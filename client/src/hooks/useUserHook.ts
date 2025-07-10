// import { useAuthStore } from '@/store/store'
// import {
//   useCreate,
//   useDelete,
//   useGetList,
//   useGetOne,
//   useUpdate,
// } from './useApiHook'
// import type { TUser } from '@/types/Tuser'

// const base = 'users'

// export const useGetUsers = (id?: string) =>
//   useGetList<TUser>('users', id ? base : base)
// export const useGetUser = (id: string) =>
//   useGetOne<TUser>('user', `${base}/${id}`, !!id)
// export const useCreateuser = () => useCreate<TUser>('users', base)
// export const useUpdateUser = () =>
//   useUpdate<TUser>('users', (id: string) => `${base}/${id}`)
// export const useDeleteUser = () =>
//   useDelete('users', (id: string) => `${base}/${id}`)
// export const useGetDoctors = () => useGetList<TUser>('users', `${base}/doctors`)

// // user data
// export const useUserData = () => {
//   const { user } = useAuthStore()
//   const userId = user?.userId || ''

//   const userData = () => useGetUsers(userId)

//   const { data } = userData()
//   const userInfo = data?.data || null

//   console.log('Raw userInfo:', userInfo)

//   // users
//   const doctors = userInfo?.filter((user) => user.role === 'doctor') || []
//   const patients = userInfo?.filter((user) => user.role === 'patient') || []
//   const profileData = userInfo?.find((user) => user.user_id === userId) || null

//   console.log('Profile Data:', profileData)

//   // appointments
//   const appointments =
//     userInfo?.map((app) => app.appointments || []).flat() || []
//   const totalAppointments = appointments.length
//   const upcomingAppointments = appointments.filter(
//     (app) => app.status === 'scheduled',
//   )
//   const completedAppointments = appointments.filter(
//     (app) => app.status === 'completed',
//   )
//   const cancelledAppointments = appointments.filter(
//     (app) => app.status === 'cancelled',
//   )
//   const pendingAppointments = appointments.filter(
//     (app) => app.status === 'pending',
//   )

//   // ✅ FIXED: Get all prescriptions (both as patient and doctor)
//   const allPrescriptions =
//     userInfo
//       ?.map((userProfile) => {
//         // Get prescriptions from diagnoses where this user is the doctor
//         const doctorPrescriptions =
//           userProfile.doctorDiagnoses
//             ?.map((diagnosis) => diagnosis.prescriptions || [])
//             .flat() || []

//         // Get prescriptions from diagnoses where this user is the patient
//         const patientPrescriptions =
//           userProfile.patientDiagnoses
//             ?.map((diagnosis) => diagnosis.prescriptions || [])
//             .flat() || []

//         return [...doctorPrescriptions, ...patientPrescriptions]
//       })
//       .flat() || []

//   console.log('All prescriptions:', allPrescriptions)

//   // ✅ FIXED: Doctor-specific prescriptions
//   const doctorDiagnoses =
//     userInfo?.map((user) => user?.doctorDiagnoses || []).flat() || []
//   const doctorPrescriptions =
//     doctorDiagnoses.map((diagnosis) => diagnosis.prescriptions || []).flat() ||
//     [] // ✅ Added missing .flat()

//   console.log('Doctor Diagnoses:', doctorDiagnoses)
//   console.log('Doctor Prescriptions:', doctorPrescriptions)

//   // ✅ FIXED: Get all medications from doctor prescriptions
//   const doctorMedications =
//     doctorPrescriptions
//       .map((prescription) => prescription.medications || [])
//       .flat() || []

//   console.log('Doctor Medications:', doctorMedications)

//   // Legacy prescriptions (keeping for backward compatibility)
//   const prescriptions = allPrescriptions
//   const totalPrescriptions = prescriptions.length
//   const activePrescriptions = prescriptions.filter(
//     (pres) => pres.status === 'active',
//   )
//   const expiredPrescriptions = prescriptions.filter(
//     (pres) => pres.status === 'expired',
//   )
//   const pendingPrescriptions = prescriptions.filter(
//     (pres) => pres.status === 'pending',
//   )
//   const completedPrescriptions = prescriptions.filter(
//     (pres) => pres.status === 'completed',
//   )
//   const cancelledPrescriptions = prescriptions.filter(
//     (pres) => pres.status === 'cancelled',
//   )
//   const med = prescriptions.map((pres) => pres.medications || []).flat()

//   // orders
//   const orders = userInfo?.map((ord) => ord.orders || []).flat() || []
//   const totalOrders = orders.length
//   const pendingOrders = orders.filter((ord) => ord.payment_status === 'pending')
//   const paidOrders = orders.filter((ord) => ord.payment_status === 'paid')
//   const failedOrders = orders.filter((ord) => ord.payment_status === 'failed')
//   const refundedOrders = orders.filter(
//     (ord) => ord.payment_status === 'refunded',
//   )
//   const recentOrders = orders.slice(0, 5).map((ord) => ({
//     order_id: ord.order_id,
//     order_date: ord.order_date,
//     delivery_status: ord.delivery_status,
//     order_number: ord.order_number,
//   }))

//   // medical records
//   const medicalRecords =
//     userInfo?.map((rec) => rec.medicalRecord || []).flat() || []
//   const totalMedicalRecords = medicalRecords.length
//   const bmiRecord = medicalRecords.find((rec) => rec.BMI !== undefined)

//   // ✅ FIXED: Patients treated by this doctor
//   const currentUser = userInfo?.find((u) => u.user_id === userId)
//   const treatedPatientIds = new Set([
//     // From appointments where this user is the doctor
//     ...appointments
//       .filter((a) => a.doctor?.user_id === userId)
//       .map((a) => a.patient?.user_id)
//       .filter(Boolean),
//     // From diagnoses where this user is the doctor
//     ...(currentUser?.doctorDiagnoses || [])
//       .map((d) => d.patient?.user_id)
//       .filter(Boolean),
//   ])

//   const myPatients = patients.filter((p) => treatedPatientIds.has(p.user_id))

//   return {
//     user,
//     doctors,
//     userInfo,
//     profileData,
//     appointments,
//     orders,
//     prescriptions,
//     totalAppointments,
//     upcomingAppointments,
//     completedAppointments,
//     cancelledAppointments,
//     pendingAppointments,
//     totalPrescriptions,
//     activePrescriptions,
//     expiredPrescriptions,
//     pendingPrescriptions,
//     completedPrescriptions,
//     cancelledPrescriptions,
//     // ✅ NEW: Doctor-specific data
//     doctorDiagnoses,
//     doctorPrescriptions,
//     doctorMedications,
//     totalOrders,
//     pendingOrders,
//     paidOrders,
//     failedOrders,
//     refundedOrders,
//     recentOrders,
//     totalMedicalRecords,
//     medicalRecords,
//     bmiRecord,
//     myPatients,
//     med,
//   }
// }

// // ✅ NEW: Specific hook for doctor prescriptions
// export const useDoctorPrescriptions = () => {
//   const { user } = useAuthStore()
//   const userId = user?.userId || ''

//   const { data } = useGetUsers(userId)
//   const userInfo = data?.data || null

//   const currentUser = userInfo?.find((u) => u.user_id === userId)

//   const doctorPrescriptions =
//     currentUser?.doctorDiagnoses
//       ?.map((diagnosis) => diagnosis.prescriptions || [])
//       .flat() || []

//   const doctorMedications =
//     doctorPrescriptions
//       .map((prescription) => prescription.medications || [])
//       .flat() || []

//   return {
//     doctorPrescriptions,
//     doctorMedications,
//     isLoading: !data,
//   }
// }

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
}

export interface Dashboard {
  user: TUser;
  profileData: TUser;
  appointments: TAppointment[];
  diagnoses: TDiagnosis[];
  prescriptions: TPrescription[];
  orders: TOrder[];
  patients?: TAppointment[];
  medications?: TMedication[];
  stats: DashboardStats;
}

import { useAuthStore } from "@/store/store";
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";
import type { TUser } from "@/types/Tuser";
import {  type TAppointment, type TDiagnosis, type TMedication, type TOrder, type TPrescription } from "@/types/api-types";

const base = 'users'

export const useGetUsers = (id?: string) =>
  useGetList<TUser>('users', id ? base : base);
export const useGetUser = (id: string) => useGetOne<TUser>('user', `${base}/${id}`, !!id);
export const useCreateuser = () => useCreate<TUser>('users', base)
export const useUpdateUser = () =>
  useUpdate<TUser>('users', (id: string) => `${base}/${id}`)
export const useDeleteUser = () => useDelete('users', (id: string) => `${base}/${id}`)
export const useGetDoctors = () => useGetList<TUser>('users', `${base}/doctors`)

// ✅ NEW: Dashboard data hook
export const useGetDashboardData = (userId: string) =>
  useGetOne<any>('dashboard', `${base}/${userId}/dashboard`, !!userId);

// ✅ SIMPLIFIED: User data hook
export const useUserData = () => {
  const { user } = useAuthStore()
  const userId = user?.userId || ''

  const { data, isLoading, error } = useGetDashboardData(userId)
  const dashboardData: Dashboard = data?.data || null

  console.log('Dashboard Data:', dashboardData)

  if (!dashboardData) {
    return {
      user: null,
      profileData: null,
      appointments: [],
      diagnoses: [],
      prescriptions: [],
      orders: [],
      patients: [],
      stats: {
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalDiagnoses: 0,
        totalPrescriptions: 0,
        activePrescriptions: 0,
        totalOrders: 0,
        pendingOrders: 0,
      },
      isLoading,
      error,
    }
  }

  return {
    user: dashboardData.user,
    profileData: dashboardData.profileData,
    appointments: dashboardData.appointments || [],
    diagnoses: dashboardData.diagnoses || [],
    prescriptions: dashboardData.prescriptions || [],
    orders: dashboardData.orders || [],
    patients: dashboardData.patients || [],
    stats: dashboardData.stats || {},
    
    
   
    doctors: dashboardData.user.role === 'doctor' ? [dashboardData.user] : [],
    userInfo: [dashboardData.user],
    totalAppointments: dashboardData.stats?.totalAppointments || 0,
    upcomingAppointments: dashboardData.appointments?.filter(a => a.status === 'scheduled') || [],
    completedAppointments: dashboardData.appointments?.filter(a => a.status === 'completed') || [],
    cancelledAppointments: dashboardData.appointments?.filter(a => a.status === 'cancelled') || [],
    pendingAppointments: dashboardData.appointments?.filter(a => a.status === 'pending') || [],
    
    totalPrescriptions: dashboardData.stats?.totalPrescriptions || 0,
    activePrescriptions: dashboardData.prescriptions?.filter(p => p.status === 'active') || [],
    expiredPrescriptions: dashboardData.prescriptions?.filter(p => p.status === 'expired') || [],
    pendingPrescriptions: dashboardData.prescriptions?.filter(p => p.status === 'pending') || [],
    completedPrescriptions: dashboardData.prescriptions?.filter(p => p.status === 'completed') || [],
    cancelledPrescriptions: dashboardData.prescriptions?.filter(p => p.status === 'cancelled') || [],
    
    // Doctor-specific data
    doctorPrescriptions: dashboardData.user?.role === 'doctor' ? dashboardData.prescriptions || [] : [],
    doctorMedications: dashboardData.user?.role === 'doctor' 
      ? dashboardData.prescriptions?.flatMap(p => p.medications || []) || []
      : [],
    myPatients: dashboardData.patients || [],
    
    totalOrders: dashboardData.stats?.totalOrders || 0,
    pendingOrders: dashboardData.orders?.filter(o => o.payment_status === 'pending') || [],
    paidOrders: dashboardData.orders?.filter(o => o.payment_status === 'paid') || [],
    failedOrders: dashboardData.orders?.filter(o => o.payment_status === 'failed') || [],
    refundedOrders: dashboardData.orders?.filter(o => o.payment_status === 'refunded') || [],
    recentOrders: dashboardData.orders?.slice(0, 5) || [],
    
    medicalRecords: dashboardData.user?.medicalRecord ? [dashboardData.user.medicalRecord] : [],
    totalMedicalRecords: dashboardData.user?.medicalRecord ? 1 : 0,
    bmiRecord: dashboardData.user?.medicalRecord?.BMI ? dashboardData.user.medicalRecord : null,
    
    isLoading,
    error,
  }
}

// ✅ NEW: Specific hooks for different roles
export const usePatientData = () => {
  const { user } = useAuthStore()
  const userId = user?.userId || ''
  
  const { data, isLoading, error } = useGetDashboardData(userId)
  const patientData = data?.data || null
  
  
  return {
    appointments: patientData?.appointments || [],
    diagnoses: patientData?.diagnoses || [],
    prescriptions: patientData?.prescriptions || [],
    orders: patientData?.orders || [],
    stats: patientData?.stats || {},
    isLoading,
    error,
  }
}

export const useDoctorData = () => {
  const { user } = useAuthStore()
  const userId = user?.userId || ''
  
  const { data, isLoading, error } = useGetDashboardData(userId)
  const doctorData = data?.data || null
  
  return {
    appointments: doctorData?.appointments || [],
    diagnoses: doctorData?.diagnoses || [],
    prescriptions: doctorData?.prescriptions || [],
    orders: doctorData?.orders || [],
    patients: doctorData?.patients || [],
    stats: doctorData?.stats || {},
    isLoading,
    error,
  }
}