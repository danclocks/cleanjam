/**
 * ===================================
 * FILE PATH: app/api/auth/signup/route.ts
 * ===================================
 * 
 * POST /api/auth/signup
 * Handles user registration with email verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, action } = body

    console.log('🔐 [SIGNUP] Request:', {
      email: email?.substring(0, 5) + '***',
      hasPassword: !!password,
      action: action || 'signup',
    })

    // ==================== ENV VALIDATION ====================

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase config')
      return NextResponse.json(
        { success: false, message: 'Server configuration error', code: 'CONFIG_ERROR' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // ==================== RESEND OTP ACTION ====================

    if (action === 'resend-otp') {
      console.log('📧 [SIGNUP] Resend OTP for:', email)

      if (!email?.trim()) {
        return NextResponse.json(
          { success: false, message: 'Email is required', code: 'MISSING_EMAIL' },
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

      try {
        console.log('📨 Using inviteUserByEmail for resend...')

        const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          email.trim().toLowerCase()
        )

        if (error) {
          console.error('❌ Resend error:', error.message)
          return NextResponse.json(
            { success: false, message: error.message || 'Resend failed', code: 'RESEND_FAILED' },
            { status: 400 }
          )
        }

        console.log('✅ Verification email resent successfully')
        return NextResponse.json(
          { success: true, message: 'Verification email sent. Check your inbox!', code: 'OTP_RESENT' },
          { status: 200 }
        )
      } catch (error: any) {
        console.error('❌ Resend exception:', error.message)
        return NextResponse.json(
          { success: false, message: error.message, code: 'RESEND_ERROR' },
          { status: 500 }
        )
      }
    }

    // ==================== SIGNUP VALIDATION ====================

    console.log('🔍 Validating inputs...')

    if (!email?.trim() || !password?.trim() || !fullName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'All fields are required', code: 'MISSING_FIELDS' },
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

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' },
        { status: 400 }
      )
    }

    if (fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Full name must be at least 2 characters', code: 'INVALID_NAME' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanFullName = fullName.trim()

    // ==================== CHECK EMAIL EXISTS ====================

    console.log('🔎 Checking if email exists...')

    try {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('email', cleanEmail)
        .single()

      if (existingUser) {
        console.error('❌ Email already registered:', cleanEmail)
        return NextResponse.json(
          { success: false, message: 'Email already registered', code: 'EMAIL_EXISTS' },
          { status: 409 }
        )
      }
    } catch (error: any) {
      if (error.code !== 'PGRST116') {
        console.error('❌ Database error:', error.message)
        return NextResponse.json(
          { success: false, message: 'Failed to verify email', code: 'DB_ERROR' },
          { status: 500 }
        )
      }
    }

    // ==================== CREATE AUTH USER ====================

    console.log('🔐 Creating auth user...')

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: false,
      user_metadata: { full_name: cleanFullName },
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return NextResponse.json(
        { success: false, message: authError.message, code: 'AUTH_ERROR' },
        { status: 400 }
      )
    }

    if (!authData?.user?.id) {
      console.error('❌ No user_id returned')
      return NextResponse.json(
        { success: false, message: 'Account creation failed', code: 'AUTH_NO_ID' },
        { status: 500 }
      )
    }

    console.log('✅ Auth user created:', authData.user.user_id)

    // ==================== CREATE PROFILE ====================

    console.log('👤 Creating profile...')

    try {
      const { error: profileError } = await supabaseAdmin.from('users').insert({
        auth_id: authData.user.user_id,
        email: cleanEmail,
        full_name: cleanFullName,
        display_name: cleanFullName,
        username: cleanFullName.toLowerCase().replace(/\s+/g, '_'),
        role: 'resident',
        is_active: true,
      })

      if (profileError) {
        console.error('❌ Profile error:', profileError.message)
        return NextResponse.json(
          { success: false, message: 'Profile creation failed', code: 'PROFILE_ERROR' },
          { status: 500 }
        )
      }

      console.log('✅ Profile created')
    } catch (error: any) {
      console.error('❌ Profile exception:', error.message)
      return NextResponse.json(
        { success: false, message: 'Profile creation failed', code: 'PROFILE_CREATION_FAILED' },
        { status: 500 }
      )
    }

    // ==================== SEND VERIFICATION EMAIL ====================

    console.log('📧 Sending verification email to:', cleanEmail)

    try {
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        cleanEmail
      )

      if (inviteError) {
        console.warn('⚠️ Email send warning:', inviteError.message)
      } else {
        console.log('✅ Verification email sent')
      }
    } catch (error: any) {
      console.warn('⚠️ Email exception:', error.message)
    }

    // ==================== SUCCESS ====================

    console.log('✅ Signup complete!')
    console.log('  - User ID:', authData.user.user_id)
    console.log('  - Email:', cleanEmail)

    return NextResponse.json(
      {
        success: true,
        message: 'Account created! Check your email to verify your account.',
        code: 'SIGNUP_SUCCESS',
        user: {
          user_id: authData.user.user_id,
          email: cleanEmail,
          fullName: cleanFullName,
        },
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}
