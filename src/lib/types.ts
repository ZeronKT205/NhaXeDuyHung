// ============================================
// TypeScript Types for Nhà Xe Duy Hùng
// Theo ERD mới với INT PK, is_deleted, etc.
// ============================================

export type PackageType = 'shared' | 'private';
export type BookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';
export type AdminRole = 'admin' | 'staff';

// --- Database Row Types ---

export interface AdminInformation {
  information_id: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  position: string | null;
  avatar_url: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  admin_id: number;
  information_id: number;
  username: string;
  password_hash: string;
  role: AdminRole;
  failed_login_attempts: number;
  locked_until: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminWithInfo extends Admin {
  admin_information: AdminInformation;
}

export interface Vehicle {
  vehicle_id: number;
  vehicle_name: string;
  license_plate: string | null;
  vehicle_type: string;
  seat_count: number;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  route_id: number;
  departure_point: string;
  destination_point: string;
  distance_km: number | null;
  estimated_duration: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Package {
  package_id: number;
  vehicle_id: number;
  route_id: number;
  package_type: PackageType;
  price: number;
  description: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageWithDetails extends Package {
  vehicles: Vehicle;
  routes: Route;
}

export interface Booking {
  booking_id: number;
  booking_code: string;
  package_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  pickup_address: string;
  dropoff_address: string;
  departure_date: string;
  passenger_count: number;
  price_at_booking: number;
  total_amount: number;
  status: BookingStatus;
  customer_note: string | null;
  internal_note: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingWithPackage extends Booking {
  packages: PackageWithDetails;
}

export interface BookingStatusHistory {
  history_id: number;
  booking_id: number;
  admin_id: number | null;
  old_status: string | null;
  new_status: string;
  note: string | null;
  is_deleted: boolean;
  changed_at: string;
}

export interface BookingStatusHistoryWithAdmin extends BookingStatusHistory {
  admins: Admin | null;
}

export interface SiteSettings {
  setting_id: number;
  hotline: string | null;
  zalo_phone: string | null;
  office_address: string | null;
  working_hours: string | null;
  banner_slogan: string | null;
  facebook_url: string | null;
  zalo_oa_url: string | null;
  is_deleted: boolean;
  updated_at: string;
}

// --- Form Types ---

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  package_id: number;
  pickup_address: string;
  dropoff_address: string;
  departure_date: string;
  passenger_count: number;
  customer_note?: string;
}

export interface VehicleFormData {
  vehicle_name: string;
  license_plate?: string;
  vehicle_type: string;
  seat_count: number;
  image_url?: string;
  description?: string;
  is_active: boolean;
}

export interface RouteFormData {
  departure_point: string;
  destination_point: string;
  distance_km?: number;
  estimated_duration?: string;
  is_active: boolean;
}

export interface PackageFormData {
  vehicle_id: number;
  route_id: number;
  package_type: PackageType;
  price: number;
  description?: string;
  is_active: boolean;
}

export interface AdminFormData {
  username: string;
  password?: string;
  role: AdminRole;
  is_active: boolean;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  position?: string;
}

export interface SiteSettingsFormData {
  hotline: string;
  zalo_phone: string;
  office_address: string;
  working_hours: string;
  banner_slogan: string;
  facebook_url: string;
  zalo_oa_url: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

// --- Stats ---
export interface DashboardStats {
  newToday: number;
  pendingConfirmation: number;
  thisWeek: number;
  thisMonth: number;
}
