/**
 * ===================================
 * FILE PATH: app/api/auth/resend-verification/route.ts
 * ===================================
 * 
 * POST /api/auth/resend-verification
 * Resends email verification to existing users
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log('📧 [RESEND-VERIFY] Request received for:', email)

    // ==================== VALIDATION ====================

    if (!email?.trim()) {
      console.error('❌ Missing email')
      return NextResponse.json(
        { success: false, message: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.error('❌ Invalid email format:', email)
      return NextResponse.json(
        { success: false, message: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    // ==================== SUPABASE ADMIN CLIENT ====================

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

    const cleanEmail = email.trim().toLowerCase()

    // ==================== VERIFY USER EXISTS ====================

    console.log('🔎 Checking if user exists...')

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return NextResponse.json(
        { success: false, message: 'Failed to verify user', code: 'LIST_ERROR' },
        { status: 500 }
      )
    }

    const user = users?.find(u => u.email?.toLowerCase() === cleanEmail)

    if (!user) {
      console.error('❌ User not found:', cleanEmail)
      return NextResponse.json(
        { success: false, message: 'User not found. Please signup first.', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', user.id)

    // ==================== RESEND VERIFICATION EMAIL ====================

    console.log('📨 Sending verification email via inviteUserByEmail...')

    // ✅ CORRECT: Use inviteUserByEmail to resend verification
    // This method is specifically designed for this use case
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail)

    if (error) {
      console.error('❌ Resend error:', error.message)
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to send email', code: 'SEND_FAILED' },
        { status: 400 }
      )
    }

    // ==================== SUCCESS ====================

    console.log('✅ Verification email sent successfully!')
    console.log('  - Email:', cleanEmail)
    console.log('  - User ID:', user.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Verification email sent successfully. Check your inbox!',
        code: 'VERIFICATION_SENT',
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('❌ Unexpected error:', error?.message || error)

    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    )
  }
}