

import type { TMedicalrecord } from "@/types/api-types";
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";

const base = 'medical-records'

export const useGetMedicalRecords = () =>
  useGetList<TMedicalrecord>('medical-records', base)
export const useGetMedicalRecord = (id: string) =>
  useGetOne<TMedicalrecord>('medical-record', `${base}/${id}`, !!id)
export const useFetchMedicalrecord = (id: string) =>
  useGetOne<TMedicalrecord>('medical-record', `${base}/patient/${id}`, !!id)
export const useCreateMedicalRecord = () =>
  useCreate<TMedicalrecord>('medical-records', base)
export const useUpdateMedicalRecord = () =>
  useUpdate<TMedicalrecord>('medical-records', (id: string) => `${base}/${id}`)
export const useDeleteMedicalRecord = () =>
  useDelete('medical-records', (id: string) => `${base}/${id}`)