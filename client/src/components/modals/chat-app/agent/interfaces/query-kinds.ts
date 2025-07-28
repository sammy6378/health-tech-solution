
export type QueryKind =
  | 'orders:paymentStatus'
  | 'orders:deliveryStatus'
  | 'orders:all'
  | 'appointments:all'
  | 'appointments:upcoming'
  | 'appointments:status'
  | 'appointments:consultationType'
  | 'payments:status'
  | 'payments:all'
  | 'diagnoses:all'
  | 'diagnoses:latest'
  | 'doctor:search'
  | 'doctor:all'
  | 'doctor:availableToday'
  | 'doctor:byName'
  | 'doctor:bySpecialization'
  | 'stock:all'
  | 'stock:available'
  | 'stock:search'
  | 'stock:oneById'
  | 'stock:byName'
  | 'stock:byCategory'
  | 'stock:byType'
  | 'stock:byManufacturer'
  | 'records:all'
  | 'prescriptions:all'
  | 'prescriptions:active'
  | 'prescriptions:pending'
  | 'unknown'

export interface DetectedQuery {
  kind: QueryKind;
  args: Record<string, any>;
  confidence: number; // 0-1 score
  fallbackQueries?: QueryKind[]; // Alternative queries to try
}
