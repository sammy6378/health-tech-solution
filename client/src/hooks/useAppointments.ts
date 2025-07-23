import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppointmentStatus, TAppointment } from '@/types/api-types'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

// Base path
const base = 'appointments'

// ✅ Get all appointments
export const useGetAppointments = () =>
  useQuery({
    queryKey: ['appointments'],
    queryFn: () => fetchList<TAppointment>(base),
  })

// ✅ Get appointments for a specific user
export const useGetAppointmentsByUser = (userId: string) =>
  useQuery({
    queryKey: ['appointments', 'user', userId],
    queryFn: () => fetchList<TAppointment>(`${base}?userId=${userId}`),
    enabled: !!userId,
  })

// ✅ Get a single appointment
export const useGetAppointment = (id: string) =>
  useQuery({
    queryKey: ['appointment', id],
    queryFn: () => fetchOne<TAppointment>(`${base}/${id}`),
    enabled: !!id,
  })

 // ✅ Get appointments by time slots for a specific doctor
export const useGetAppointmentsByTimeSlots = (appointmentDate: string,doctor_id:string) => {
  return useQuery({
    queryKey: ['appointments', 'available-slots', doctor_id, appointmentDate],
    queryFn: () =>
      fetchList<TAppointment>(
        `${base}/available-slots?doctor_id=${doctor_id}&appointment_date=${appointmentDate}`,
      ),
    enabled: !!appointmentDate && !!doctor_id,
  })
}

// get pending meeting links
export const useGetPendingMeetingLinks = () =>
  useQuery({
    queryKey: ['appointments', 'pending-meeting-links'],
    queryFn: () => fetchList<TAppointment>(`${base}/pending-meeting-links`),
  })


// ✅ Create an appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<TAppointment>) =>
      createItem<TAppointment>(base, data),
    onSuccess: (_, __,) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false }) // All dashboards
    },
  })
}

// create meeting link
export const useCreateMeetingLink = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      createItem<{ meeting_link: string }>(`${base}/${id}/meeting-link`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// update status
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateItem<TAppointment>(`${base}/${id}/status`, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Update an appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TAppointment> }) =>
      updateItem<TAppointment>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Delete an appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
