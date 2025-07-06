import type { TMedication } from "@/types/api-types";
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";

const base = 'stocks';

export const useGetMedications = () => useGetList<TMedication>('medications', base)
export const useGetMedication = (id: string) =>
  useGetOne<TMedication>('medication', `${base}/${id}`, !!id)
export const useCreateMedication = () => useCreate<TMedication>('medications', base)
export const useUpdateMedication = () =>
  useUpdate<TMedication>('medications', (id: string) => `${base}/${id}`)
export const useDeleteMedication = () =>
  useDelete('medications', (id: string) => `${base}/${id}`)
