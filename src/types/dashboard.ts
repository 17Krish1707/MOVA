export type DeliveryStatus = 'pending' | 'in_transit' | 'delayed' | 'delivered' | 'cancelled';

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';

export interface Delivery {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  destinationAddress: string;
  destinationCity: string;
  driverId: string | null;
  driverName: string | null;
  status: DeliveryStatus;
  priority: PriorityLevel;
  eta: string;
  packagesCount: number;
  weightKg: number;
  createdAt: string;
  notes?: string;
}

export type DriverStatusType = 'available' | 'on_delivery' | 'resting' | 'offline';

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: DriverStatusType;
  vehicleId: string;
  vehiclePlate: string;
  completedDeliveriesToday: number;
  rating: number;
  batteryPercent: number;
  currentLocationName: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'Electric Van' | 'Cargo Bike' | 'EV Truck' | 'Standard Van';
  capacityKg: number;
  fuelOrBatteryPercent: number;
  status: 'active' | 'maintenance' | 'idle';
  assignedDriverName: string | null;
}

export interface Route {
  id: string;
  routeCode: string;
  driverName: string;
  vehiclePlate: string;
  totalStops: number;
  completedStops: number;
  estimatedDistanceKm: number;
  status: 'in_progress' | 'scheduled' | 'completed';
}

export interface Incident {
  id: string;
  deliveryId: string;
  trackingCode: string;
  type: 'Traffic Delay' | 'Customer Unavailable' | 'Vehicle Malfunction' | 'Address Error';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
  resolved: boolean;
}

export interface DashboardStats {
  activeDeliveries: number;
  activeDeliveriesTrend: string;
  pendingOrders: number;
  pendingOrdersTrend: string;
  availableDrivers: number;
  totalDrivers: number;
  delayedDeliveries: number;
  delayedDeliveriesTrend: string;
}

export type NavigationTab = 'overview' | 'orders' | 'drivers' | 'vehicles' | 'routes' | 'incidents';
