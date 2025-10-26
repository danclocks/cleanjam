/**
 * ===================================
 * FILE PATH: lib/auth.ts
 * ===================================
 * 
 * Complete auth utilities for frontend
 * Handles signup, login, logout, session management
 */

import { supabase } from './supabaseClient'

// ==================== SIGNUP ====================

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { data: null, error: data.message || 'Signup failed' }
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action: 'resend-otp' }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { data: null, error: data.message || 'Resend failed' }
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ==================== LOGIN ====================

/**
 * Login with email and password
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { data: null, error: data.message || 'Login failed' }
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ==================== LOGOUT ====================

/**
 * Logout current user
 * Gets the current session, sends access token to API, redirects to homepage
 */
export async function logout() {
  try {
    console.log('👋 [LOGOUT] Starting logout process...')

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.warn('⚠️ No session found, redirecting to home')
      // Even if no session, redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return { error: null }
    }

    console.log('✅ Session found, calling logout API...')

    // Call logout API with access token
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      console.error('❌ Logout API error:', data.message)
      return { error: data.message || 'Logout failed' }
    }

    console.log('✅ Logout successful!')

    // Clear session from localStorage
    clearSession()

    // Redirect to homepage (API also redirects, but this ensures it)
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }

    return { error: null }
  } catch (error: any) {
    console.error('❌ Logout error:', error.message)
    return { error: error.message }
  }
}

// ==================== SESSION STORAGE ====================

/**
 * Store session tokens after successful login
 */
export function storeSession(session: any) {
  if (typeof window === 'undefined') return

  if (session?.accessToken) {
    localStorage.setItem('accessToken', session.accessToken)
  }
  if (session?.refreshToken) {
    localStorage.setItem('refreshToken', session.refreshToken)
  }
}

/**
 * Get stored access token
 */
export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

/**
 * Get stored refresh token
 */
export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

/**
 * Clear all session data
 */
export function clearSession() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('accessToken')
}

/**
 * Get stored user data
 */
export function getStoredUser() {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

/**
 * Store user data after login
 */
export function storeUser(user: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

// ==================== SUPABASE CLIENT ====================

/**
 * Get current user from Supabase session
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    return { data, error: error?.message }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    return { data, error: error?.message }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ==================== EXPORTS ====================

export { supabase }