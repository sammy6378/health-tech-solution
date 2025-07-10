

import type { TDiagnosis } from "@/types/api-types";
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";

const base = 'diagnosis'

export const useGetDiagnosises = () => useGetList<TDiagnosis>('diagnosis', base)
export const useGetDiagnosis = (id: string) =>
  useGetOne<TDiagnosis>('diagnosis', `${base}/${id}`, !!id)
export const useCreateDiagnosis = () => useCreate<TDiagnosis>('diagnosis', base)
export const useUpdateDiagnosis = () =>
  useUpdate<TDiagnosis>('diagnosis', (id: string) => `${base}/${id}`)
export const useDeleteDiagnosis = () =>
  useDelete('diagnosis', (id: string) => `${base}/${id}`)