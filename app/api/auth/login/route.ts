/**
 * ===================================
 * FILE PATH: app/api/auth/login/route.ts
 * ===================================
 * 
 * POST /api/auth/login
 * Handles user authentication and login
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 [LOGIN] Request:', {
      email: email?.substring(0, 5) + '***',
      hasPassword: !!password,
    })

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

    // ==================== INPUT VALIDATION ====================

    console.log('🔍 Validating inputs...')

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    // ==================== CREATE SUPABASE CLIENT ====================

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // ==================== AUTHENTICATE USER ====================

    console.log('🔐 Authenticating user...')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      
      // Return different message for security
      return NextResponse.json(
        { success: false, message: 'Invalid email or password', code: 'AUTH_FAILED' },
        { status: 401 }
      )
    }

    if (!authData?.user) {
      console.error('❌ No user returned from auth')
      return NextResponse.json(
        { success: false, message: 'Authentication failed', code: 'NO_USER' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', authData.user.id)

    // ==================== CHECK EMAIL VERIFIED ====================

    console.log('📧 Checking if email is verified...')

    if (!authData.user.email_confirmed_at) {
      console.warn('⚠️ Email not verified for user:', cleanEmail)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please verify your email before logging in', 
          code: 'EMAIL_NOT_VERIFIED',
          userId: authData.user.id,
          email: cleanEmail
        },
        { status: 403 }
      )
    }

    console.log('✅ Email verified')

    // ==================== GET USER PROFILE ====================

    console.log('👤 Fetching user profile...')

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError.message)
      // Don't fail login - profile might not exist yet
      console.warn('⚠️ User profile not found, but auth succeeded')
    }

    if (userProfile) {
      console.log('✅ User profile found:', userProfile.user_id)
    }

    // ==================== SUCCESS ====================

    console.log('✅ Login successful!')
    console.log('  - User ID:', authData.user.id)
    console.log('  - Email:', cleanEmail)

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        code: 'LOGIN_SUCCESS',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: authData.user.user_metadata?.full_name,
          emailVerified: !!authData.user.email_confirmed_at,
        },
        profile: userProfile ? {
          userId: userProfile.user_id,
          fullName: userProfile.full_name,
          username: userProfile.username,
          role: userProfile.role,
          isActive: userProfile.is_active,
        } : null,
        session: {
          accessToken: authData.session?.access_token,
          refreshToken: authData.session?.refresh_token,
          expiresIn: authData.session?.expires_in,
        },
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}