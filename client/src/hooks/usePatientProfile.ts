

import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";
import type { TPatient } from "@/types/Tuser";

const base = 'patient-profile'

export const useGetPatientProfiles = () =>
  useGetList<TPatient>('patient-profiles', base)
export const useGetPatientProfile = (id: string) =>
  useGetOne<TPatient>('patient-profile', `${base}/${id}`, !!id)
export const useCreatePatientProfile = () =>
  useCreate<TPatient>('patient-profiles', base)
export const useUpdatePatientProfile = () =>
  useUpdate<TPatient>('patient-profiles', (id: string) => `${base}/${id}`)
export const useDeletePatientProfile = () =>
  useDelete('patient-profiles', (id: string) => `${base}/${id}`)