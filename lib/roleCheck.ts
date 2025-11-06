/**
 * ================================================================
 * FILE PATH: lib/roleCheck.ts
 * 
 * Role-based access control utility
 * Checks user role: resident, admin, supadmin
 * ================================================================
 */

import { createClient } from "@supabase/supabase-js";

export type UserRole = "resident" | "admin" | "supadmin";

interface UserWithRole {
  user_id: number;
  auth_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
}

/**
 * Get user role from database
 * @param authId - Supabase auth UUID
 * @returns User with role info or null if not found
 */
export async function getUserRole(authId: string): Promise<UserWithRole | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, auth_id, email, full_name, role, is_active")
      .eq("auth_id", authId)
      .single();

    if (error || !data) {
      console.error("❌ Failed to fetch user role:", error?.message);
      return null;
    }

    return data as UserWithRole;
  } catch (err) {
    console.error("❌ Error fetching user role:", err);
    return null;
  }
}

/**
 * Check if user has admin or supadmin role
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === "admin" || role === "supadmin";
}

/**
 * Check if user is supadmin
 */
export function isSupaAdmin(role: UserRole | null): boolean {
  return role === "supadmin";
}

/**
 * Check if user is resident
 */
export function isResident(role: UserRole | null): boolean {
  return role === "resident";
}