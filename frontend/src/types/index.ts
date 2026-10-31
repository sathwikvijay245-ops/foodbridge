export type UserRole = 'donor' | 'recipient' | 'admin';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type FoodCategory =
  | 'cooked_meals'
  | 'bakery_pastries'
  | 'fresh_produce'
  | 'dairy_chilled'
  | 'packaged_pantry'
  | 'beverages'
  | 'other';

export type StorageRequirement = 'room_temp' | 'refrigerated' | 'frozen' | 'hot_holding';

export type ListingStatus =
  | 'available'
  | 'reserved'
  | 'picked_up'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export type ReportStatus = 'open' | 'in_review' | 'resolved' | 'dismissed';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  org_name: string;
  org_type?: string;
  phone?: string;
  address?: string;
  city?: string;
  charity_reg_number?: string;
  verification_status: VerificationStatus;
  refrigerated_transport?: boolean;
  volunteer_capacity?: string;
  mission_statement?: string;
  food_safety_cert_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface DonorSummary {
  id: number;
  full_name: string;
  org_name: string;
  org_type?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface RecipientSummary {
  id: number;
  full_name: string;
  org_name: string;
  org_type?: string;
  charity_reg_number?: string;
  verification_status: VerificationStatus;
  phone?: string;
  refrigerated_transport?: boolean;
}

export interface FoodListing {
  id: number;
  donor_id: number;
  donor?: DonorSummary;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  quantity_kg: number;
  estimated_meals: number;
  preparation_time: string;
  use_by_time: string;
  storage_requirement: StorageRequirement;
  packaging_info?: string;
  dietary_tags?: string;
  allergen_info?: string;
  pickup_address: string;
  pickup_city: string;
  pickup_zip?: string;
  latitude: number;
  longitude: number;
  pickup_instructions?: string;
  pickup_start: string;
  pickup_end: string;
  food_safety_certified: boolean;
  food_safety_notes?: string;
  status: ListingStatus;
  pickup_code?: string;
  created_at: string;
  updated_at: string;
  requests_count?: number;
  accepted_request_id?: number;
}

export interface DonationRequest {
  id: number;
  listing_id: number;
  recipient_id: number;
  status: RequestStatus;
  requested_quantity?: string;
  transport_type: string;
  estimated_pickup_time: string;
  contact_phone: string;
  recipient_notes?: string;
  donor_response_notes?: string;
  cancellation_reason?: string;
  pickup_confirmed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  recipient?: RecipientSummary;
  listing?: FoodListing;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface ReportItem {
  id: number;
  listing_id?: number;
  reporter_id: number;
  reported_user_id?: number;
  reason: string;
  details: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
  reporter?: User;
  reported_user?: User;
}

export interface ImpactMetrics {
  total_donations_completed: number;
  total_kg_redistributed: number;
  total_meals_provided: number;
  co2e_avoided_kg: number;
  water_saved_liters: number;
  active_listings_count: number;
  active_donors_count: number;
  verified_recipients_count: number;
  category_breakdown: Array<{
    category: string;
    quantity_kg: number;
    label: string;
  }>;
  top_donors: Array<{
    name: string;
    donations: number;
    kg: number;
    meals: number;
  }>;
  top_recipients: Array<{
    name: string;
    received_count: number;
    kg: number;
    meals: number;
  }>;
  recent_completions: Array<{
    title: string;
    category: string;
    quantity: string;
    meals: number;
    donor_org: string;
    date: string;
  }>;
}

export interface AuditLogItem {
  id: number;
  user_id?: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  timestamp: string;
}

export interface DemoUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  org_name: string;
  org_type?: string;
  verification_status: VerificationStatus;
}
