
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";
import type { TUser } from "@/types/Tuser";

const base = 'users'

export const useGetUsers = () => useGetList<TUser>('users', base);
export const useGetUser = (id: string) => useGetOne<TUser>('user', `${base}/${id}`, !!id);
export const useCreateuser = () => useCreate<TUser>('users', base)
export const useUpdateUser = () =>
  useUpdate<TUser>('users', (id: string) => `${base}/${id}`)
export const useDeleteUser = () => useDelete('users', (id: string) => `${base}/${id}`)

export const useGetDoctors = () => useGetList<TUser>('users', `${base}/doctors`)