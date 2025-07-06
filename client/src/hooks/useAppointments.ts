import type { TAppointment } from "@/types/api-types";
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";
import { useAuthStore } from "@/store/store";

const base = 'appointments';

export const useGetAppointments = () => useGetList<TAppointment>('appointments', base)
export const useGetAppointmentsByUser = (userId: string) =>
  useGetList<TAppointment>('appointments', `${base}?userId=${userId}`)

export const useGetAppointment = (id: string) =>
  useGetOne<TAppointment>('appointment', `${base}/${id}`, !!id)
export const useCreateAppointment = () =>
  useCreate<TAppointment>('appointments', base)
  
export const useUpdateAppointment = () => useUpdate<TAppointment>(
  'appointments',
  (id: string) => `${base}/${id}`,
)
export const useDeleteAppointment = () => useDelete(
  'appointments',
  (id: string) => `${base}/${id}`,
)

export const useAppointmentMetrics = () => {
   const {user} = useAuthStore()
    const userId = user?.userId || '';
    const { data: appointmnets } = useGetAppointmentsByUser(userId)
    if( !appointmnets || !appointmnets.data) {
        return {
            completed: [],
            pending: [],
            cancelled: [],
            scheduled: [],
            total: 0,
            upcoming: [],
        };
    }
    const completed = appointmnets.data?.filter(a => a.status === 'completed') || [];
    const pending = appointmnets.data?.filter(a => a.status === 'pending') || [];
    const cancelled = appointmnets.data?.filter(a => a.status === 'cancelled') || [];
    const scheduled = appointmnets.data?.filter(a => a.status === 'scheduled').length || 0;
    const total = appointmnets.data?.length || 0;
    const upcoming = appointmnets.data?.filter(a => new Date(a.appointment_date) > new Date()) || [];
    return {
        completed,
        pending,
        cancelled,
        scheduled,
        total,
        upcoming,
    };
}