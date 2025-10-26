import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * ===================================
 * SUPABASE CLIENT & DATABASE TYPES
 * ===================================
 * 
 * This file initializes the Supabase client and defines
 * TypeScript types for all CleanJamaica database tables.
 */

// ==================== INITIALIZATION ====================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==================== DATABASE TYPES ====================

/**
 * Users Table - All system users (residents, admins, field officers, partners)
 */
export interface User {
  user_id: number
  auth_id?: string
  username: string
  email: string
  full_name: string
  phone?: string
  role: 'resident' | 'admin' | 'field_officer' | 'partner'
  avatar_url?: string
  address?: string
  community?: string
  latitude?: number
  longitude?: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

/**
 * Admin Users Table - Extended info for admin users
 */
export interface AdminUser {
  admin_id: number
  user_id: number
  department?: string
  phone?: string
  address?: string
  is_active: boolean
  created_at: string
}

/**
 * Collection Schedules Table - Garbage pickup schedules by community
 */
export interface CollectionSchedule {
  schedule_id: number
  community_name: string
  pickup_day: string
  pickup_time: string
  frequency: 'weekly' | 'bi-weekly' | 'monthly'
  truck_route?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at?: string
}

/**
 * Reports Table - Garbage issues and illegal dumps
 */
export interface Report {
  report_id: number
  user_id: number
  location: string
  latitude?: number
  longitude?: number
  description: string
  report_type: 'uncollected_garbage' | 'illegal_dump' | 'overflow' | 'missed_collection'
  photo_url?: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: number
  created_at: string
  resolved_at?: string
  resolution_notes?: string
}

/**
 * Report Updates Table - Status tracking and audit trail
 */
export interface ReportUpdate {
  update_id: number
  report_id: number
  updated_by: number
  old_status?: string
  new_status: string
  comments?: string
  photo_url?: string
  update_type: 'status_change' | 'assignment' | 'photo_upload' | 'completion' | 'rejection'
  created_at: string
}

/**
 * Rewards Table - Recycling points and tier management
 */
export interface Reward {
  reward_id: number
  user_id: number
  points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  total_recycled_kg: number
  recycling_sessions: number
  last_updated: string
  created_at: string
}

/**
 * Recycling Transactions Table - Individual recycling submissions
 */
export interface RecyclingTransaction {
  transaction_id: number
  reward_id: number
  partner_id: number
  description: string
  material_type: string
  weight_kg: number
  points_earned: number
  transaction_date: string
  verified_by?: number
  verification_date?: string
  created_at: string
}

/**
 * Recycling Partners Table - Third-party recycling organizations
 */
export interface RecyclingPartner {
  partner_id: number
  name: string
  contact_email: string
  contact_phone?: string
  address: string
  latitude?: number
  longitude?: number
  material_accepted: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

/**
 * Reward Redemptions Table - Points redemption history
 */
export interface RewardRedemption {
  redemption_id: number
  reward_id: number
  points_redeemed: number
  reward_item: string
  redemption_date: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}

/**
 * Notifications Table - System notifications
 */
export interface Notification {
  notification_id: number
  user_id: number
  title: string
  message: string
  notification_type: 'report_update' | 'reward_earned' | 'schedule_reminder' | 'system_alert' | 'achievement'
  related_report_id?: number
  is_read: boolean
  created_at: string
  read_at?: string
}

/**
 * Analytics Table - Daily system metrics
 */
export interface Analytics {
  analytics_id: number
  metrics_date: string
  total_reports: number
  resolved_reports: number
  pending_reports: number
  total_recycled_kg: number
  total_points_awarded: number
  active_users: number
  created_at: string
}

// ==================== DATABASE INTERFACE ====================

/**
 * Type-safe database interface for use with Supabase
 * Includes all tables with proper TypeScript support
 */
export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'user_id' | 'created_at'>; Update: Partial<User> }
      admin_users: { Row: AdminUser; Insert: Omit<AdminUser, 'admin_id' | 'created_at'>; Update: Partial<AdminUser> }
      collection_schedules: { Row: CollectionSchedule; Insert: Omit<CollectionSchedule, 'schedule_id' | 'created_at'>; Update: Partial<CollectionSchedule> }
      reports: { Row: Report; Insert: Omit<Report, 'report_id' | 'created_at'>; Update: Partial<Report> }
      report_updates: { Row: ReportUpdate; Insert: Omit<ReportUpdate, 'update_id' | 'created_at'>; Update: Partial<ReportUpdate> }
      rewards: { Row: Reward; Insert: Omit<Reward, 'reward_id' | 'created_at'>; Update: Partial<Reward> }
      recycling_transactions: { Row: RecyclingTransaction; Insert: Omit<RecyclingTransaction, 'transaction_id' | 'created_at'>; Update: Partial<RecyclingTransaction> }
      recycling_partners: { Row: RecyclingPartner; Insert: Omit<RecyclingPartner, 'partner_id' | 'created_at'>; Update: Partial<RecyclingPartner> }
      reward_redemptions: { Row: RewardRedemption; Insert: Omit<RewardRedemption, 'redemption_id' | 'created_at'>; Update: Partial<RewardRedemption> }
      notifications: { Row: Notification; Insert: Omit<Notification, 'notification_id' | 'created_at'>; Update: Partial<Notification> }
      analytics: { Row: Analytics; Insert: Omit<Analytics, 'analytics_id' | 'created_at'>; Update: Partial<Analytics> }
    }
  }
}