/**
 * ===================================
 * FILE PATH: app/api/auth/logout/route.ts
 * ===================================
 * 
 * POST /api/auth/logout
 * Handles user logout and session termination
 * Expects Authorization header with Bearer token from client
 * Redirects to homepage on successful logout
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('👋 [LOGOUT] Request received')

    // ==================== ENV VALIDATION ====================

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase config')
      return NextResponse.json(
        { success: false, message: 'Server configuration error', code: 'CONFIG_ERROR' },
        { status: 500 }
      )
    }

    // ==================== GET TOKEN FROM AUTHORIZATION HEADER ====================

    console.log('🔍 Reading Authorization header...')

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      console.warn('⚠️ No authorization token found')
      return NextResponse.json(
        { success: false, message: 'No active session', code: 'NO_SESSION' },
        { status: 401 }
      )
    }

    console.log('✅ Token found, creating authenticated client...')

    // ==================== CREATE AUTHENTICATED SUPABASE CLIENT ====================

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // ==================== VERIFY SESSION ====================

    console.log('🔍 Verifying session with token...')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Invalid token or session:', userError?.message)
      return NextResponse.json(
        { success: false, message: 'Invalid session', code: 'INVALID_SESSION' },
        { status: 401 }
      )
    }

    console.log('✅ Session verified:', user.id)

    // ==================== LOGOUT ====================

    console.log('👋 Signing out user...')

    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      console.error('❌ Logout error:', logoutError.message)
      // Still proceed to redirect even if signOut fails
      console.log('⚠️ SignOut had an error, but proceeding with redirect...')
    }

    // ==================== SUCCESS WITH REDIRECT ====================

    console.log('✅ Logout successful!')
    console.log('  - User ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Redirecting to homepage...')

    // Redirect to homepage after successful logout
    return NextResponse.redirect(new URL('/', request.url), { status: 302 })

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}