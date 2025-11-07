/**
 * ================================================================
 * FILE PATH: lib/auth-helpers.ts
 * CREATED: November 6, 2025
 * 
 * AUTH HELPER UTILITIES
 * Get authenticated user's auth_id for API calls and authentication.
 * ================================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Get current user's auth_id from Supabase session
 * Returns auth_id UUID or null if not authenticated
 */
export async function getCurrentUserAuthId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      console.log('No session found');
      return null;
    }

    const authId = data.session.user.id;
    console.log('✅ Auth ID retrieved:', authId);
    return authId;
  } catch (error: any) {
    console.error('❌ Error getting auth ID:', error);
    return null;
  }
}

/**
 * Alternative: Get auth_id from localStorage (for client-side)
 * Supabase stores session in localStorage by default
 */
export function getAuthIdFromStorage(): string | null {
  try {
    // Supabase stores auth in: supabase.auth.token
    const authData = localStorage.getItem('sb-AUTH_TOKEN-uuid');
    
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.session?.user?.id || null;
      } catch {
        return null;
      }
    }

    // Fallback: Try another common localStorage key
    const supabaseData = localStorage.getItem('supabase.auth.token');
    if (supabaseData) {
      try {
        const parsed = JSON.parse(supabaseData);
        return parsed?.user?.id || null;
      } catch {
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error retrieving auth ID from storage:', error);
    return null;
  }
}

/**
 * Get authenticated user's email
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}