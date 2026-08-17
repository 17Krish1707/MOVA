import { apiClient } from './client';
import type { Delivery, DeliveryStatus, PriorityLevel } from '../types/dashboard';

/**
 * Raw MongoDB delivery document structure returned by Express / Mongoose backend.
 */
export interface RawDeliveryResponse {
  _id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  destinationAddress: string;
  destinationCity: string;
  driverId?: string | null;
  driverName?: string | null;
  status: DeliveryStatus;
  priority: PriorityLevel;
  eta: string;
  packagesCount: number;
  weightKg: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

/**
 * Payload interface for creating a new delivery order.
 */
export interface CreateDeliveryInput {
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  destinationAddress: string;
  destinationCity: string;
  driverId?: string | null;
  driverName?: string | null;
  status?: DeliveryStatus;
  priority?: PriorityLevel;
  eta: string;
  packagesCount: number;
  weightKg: number;
  notes?: string;
}

/**
 * Payload interface for partially updating an existing delivery order.
 */
export type UpdateDeliveryInput = Partial<CreateDeliveryInput>;

/**
 * Response payload returned when a delivery is deleted.
 */
export interface DeleteDeliveryResponse {
  message: string;
  id: string;
}

/**
 * Maps raw backend MongoDB document (`_id`, nullable fields) to the frontend `Delivery` interface.
 */
export const mapDeliveryResponse = (raw: RawDeliveryResponse): Delivery => ({
  id: raw._id,
  trackingCode: raw.trackingCode,
  customerName: raw.customerName,
  customerPhone: raw.customerPhone,
  destinationAddress: raw.destinationAddress,
  destinationCity: raw.destinationCity,
  driverId: raw.driverId ?? null,
  driverName: raw.driverName ?? null,
  status: raw.status,
  priority: raw.priority,
  eta: raw.eta,
  packagesCount: raw.packagesCount,
  weightKg: raw.weightKg,
  createdAt: raw.createdAt,
  notes: raw.notes,
});

/**
 * Fetch all deliveries from the backend.
 */
export async function getDeliveries(): Promise<Delivery[]> {
  const rawDeliveries = await apiClient.get<RawDeliveryResponse[]>('/api/deliveries');
  return rawDeliveries.map(mapDeliveryResponse);
}

/**
 * Fetch a single delivery by its unique identifier.
 */
export async function getDeliveryById(id: string): Promise<Delivery> {
  const rawDelivery = await apiClient.get<RawDeliveryResponse>(`/api/deliveries/${id}`);
  return mapDeliveryResponse(rawDelivery);
}

/**
 * Create a new delivery order on the backend.
 */
export async function createDelivery(data: CreateDeliveryInput): Promise<Delivery> {
  const createdRaw = await apiClient.post<RawDeliveryResponse>('/api/deliveries', data);
  return mapDeliveryResponse(createdRaw);
}

/**
 * Update an existing delivery order (partial update via PATCH).
 */
export async function updateDelivery(id: string, data: UpdateDeliveryInput): Promise<Delivery> {
  const updatedRaw = await apiClient.patch<RawDeliveryResponse>(`/api/deliveries/${id}`, data);
  return mapDeliveryResponse(updatedRaw);
}

/**
 * Delete a delivery order by ID.
 */
export async function deleteDelivery(id: string): Promise<DeleteDeliveryResponse> {
  return apiClient.delete<DeleteDeliveryResponse>(`/api/deliveries/${id}`);
}
