import type { TOrder } from "@/types/api-types";
import { useCreate, useDelete, useGetList, useGetOne, useUpdate } from "./useApiHook";

const base = 'orders';

export const useGetOrders = () => useGetList<TOrder>('orders', base)
export const useGetOrder = (id: string) =>
  useGetOne<TOrder>('order', `${base}/${id}`, !!id)
export const useCreateOrder = () => useCreate<TOrder>('orders', base)
export const useUpdateOrder = () =>
  useUpdate<TOrder>('orders', (id: string) => `${base}/${id}`)
export const useDeleteOrder = () =>
  useDelete('orders', (id: string) => `${base}/${id}`)

export const useGetOrderMetrics = () => {
  const { data } = useGetOrders();
  const orders = data?.data || [];
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.delivery_status === 'pending').length || 0;
  const processingOrders = orders?.filter((o) => o.delivery_status === 'processing').length || 0;
  const shippedOrders = orders?.filter((o) => o.delivery_status === 'shipped').length || 0;
  const deliveredOrders = orders?.filter((o) => o.delivery_status === 'delivered').length || 0;
  const cancelledOrders = orders?.filter((o) => o.delivery_status === 'cancelled').length || 0;
  const recentOrders = orders?.slice(0, 5) || [];

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    orders,
    recentOrders,
  };
}
