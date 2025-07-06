import type { TPrescription } from "@/types/api-types";
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";
import { useAuthStore } from "@/store/store";

const base = 'prescriptions';

export const useGetPrescriptions = () => useGetList<TPrescription>('prescriptions', base)
export const useGetPrescriptionsByPatient = (patientId: string) =>
  useGetList<TPrescription>('prescriptions', `${base}/patient/${patientId}`)
export const useGetPrescription = (id: string) =>
  useGetOne<TPrescription>('prescription', `${base}/${id}`, !!id)
export const useCreatePrescription = () =>
  useCreate<TPrescription>('prescriptions', base)
export const useUpdatePrescription = () =>
  useUpdate<TPrescription>('prescriptions', (id: string) => `${base}/${id}`)
export const useDeletePrescription = () =>
  useDelete('prescriptions', (id: string) => `${base}/${id}`)

export const useGetPrescriptionMetrics = () => {
    const {user} = useAuthStore()
      const userId = user?.userId || '';
  const { data } = useGetPrescriptionsByPatient(userId)
  const prescriptions = data?.data || [];
  const totalPrescriptions = prescriptions?.length || 0
  const activePrescriptions =
    prescriptions?.filter((p) => p.status === 'active').length || 0
  const expiredPrescriptions =
    prescriptions?.filter((p) => p.status === 'expired').length || 0
  const pendingPrescriptions =
    prescriptions?.filter((p) => p.status === 'pending').length || 0
  const completedPrescriptions = prescriptions?.filter(p => p.status === 'completed').length || 0;
  const cancelledPrescriptions =
    prescriptions?.filter((p) => p.status === 'cancelled').length || 0

    const active = prescriptions?.filter((p) => p.status === 'active') || [];

  return {
    totalPrescriptions,
    activePrescriptions,
    expiredPrescriptions,
    pendingPrescriptions,
    completedPrescriptions,
    cancelledPrescriptions,
    active,
  }
}