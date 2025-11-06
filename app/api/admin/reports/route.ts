/**
 * ================================================================
 * FILE PATH: app/api/admin/reports/route.ts
 * 
 * ADMIN REPORTS API - FIXED
 * Using SUPABASE_SERVICE_ROLE_KEY (not NEXT_PUBLIC prefix)
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ==================== HELPERS ====================

/**
 * Verify admin auth from JWT token
 */
async function verifyAdminAuth(request: NextRequest) {
  try {
    console.log('🔐 [API] Verifying admin auth...')

    const authHeader = request.headers.get('Authorization')
    console.log('📌 Auth header present:', !!authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Invalid auth header format')
      return { error: 'Missing auth token', status: 401 }
    }

    const token = authHeader.substring(7)
    console.log('📌 Token extracted, length:', token.length)

    // Verify token with anon key first
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: authData, error: authError } = await supabaseAnon.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return { error: 'Unauthorized - invalid token', status: 401 }
    }

    if (!authData.user) {
      console.error('❌ No user in auth data')
      return { error: 'Unauthorized - no user', status: 401 }
    }

    console.log('✅ User authenticated:', authData.user.id)

    // Get service role key (NO NEXT_PUBLIC prefix)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing from environment')
      return { error: 'Server configuration error - missing SUPABASE_SERVICE_ROLE_KEY', status: 500 }
    }

    // Check if user is admin using service role
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey,
    )

    console.log('🔍 Checking user role in database...')

    const { data: userRecord, error: userError } = await db
      .from('users')
      .select('user_id, role, email')
      .eq('auth_id', authData.user.id)
      .maybeSingle()

    if (userError) {
      console.error('❌ User query error:', userError.message)
      return { error: `User lookup failed: ${userError.message}`, status: 500 }
    }

    if (!userRecord) {
      console.error('❌ User not found in database for auth_id:', authData.user.id)
      return { error: 'User record not found', status: 404 }
    }

    console.log('✅ User found:', userRecord.email, 'Role:', userRecord.role)

    if (userRecord.role !== 'admin' && userRecord.role !== 'supadmin') {
      console.error('❌ User is not admin. Role:', userRecord.role)
      return { error: `Access denied - user role is ${userRecord.role}, not admin`, status: 403 }
    }

    console.log('✅ Admin verification successful')
    return { success: true, userId: authData.user.id, userRecord }
  } catch (error: any) {
    console.error('❌ Auth verification exception:', error.message)
    return { error: `Auth verification failed: ${error.message}`, status: 500 }
  }
}

// ==================== GET: FETCH ALL REPORTS ====================

export async function GET(request: NextRequest) {
  try {
    console.log('📡 [API] GET /api/admin/reports')

    // Verify admin auth
    const auth = await verifyAdminAuth(request)
    if (auth.error) {
      console.log(`⚠️ Auth failed: ${auth.error} (status: ${auth.status})`)
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    console.log('✅ Auth passed, fetching reports...')

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🔍 Filters:', { status, priority, limit, offset })

    // Get service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Query reports from view
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey,
    )

    let query = db
      .from('vw_user_report_detail')
      .select(
        `
        report_id,
        report_type,
        description,
        status,
        priority,
        photo_urls,
        submitted_at,
        resolved_at,
        report_street,
        report_community,
        report_latitude,
        report_longitude,
        user_id,
        users (
          user_id,
          full_name,
          email,
          username
        )
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    // Order and pagination
    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: reports, error: reportsError, count } = await query

    if (reportsError) {
      console.error('❌ Query error:', reportsError.message)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch reports',
          details: reportsError.message,
        },
        { status: 500 }
      )
    }

    console.log(
      `✅ Fetched ${reports?.length || 0} reports (total: ${count})`
    )

    // Transform reports to match frontend interface
    const transformedReports = (reports || []).map((report: any) => ({
      report_id: report.report_id,
      report_type: report.report_type,
      description: report.description,
      status: report.status,
      priority: report.priority,
      photo_urls: report.photo_urls || [],
      submitted_at: report.submitted_at,
      resolved_at: report.resolved_at,
      street: report.street,
      community: report.community,
      latitude: report.latitude,
      longitude: report.longitude,
      users: report.users
        ? {
            user_id: report.users.user_id,
            full_name: report.users.full_name,
            email: report.users.email,
            username: report.users.username,
          }
        : null,
    }))

    return NextResponse.json(
      {
        success: true,
        reports: transformedReports,
        totalCount: count || 0,
        pagination: { limit, offset },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// ==================== PUT: UPDATE REPORT STATUS ====================

export async function PUT(request: NextRequest) {
  try {
    console.log('📝 [API] PUT /api/admin/reports')

    // Verify admin auth
    const auth = await verifyAdminAuth(request)
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      )
    }

    const body = await request.json()
    const { reportId, status, resolutionNotes } = body

    console.log('📝 Update request:', {
      reportId,
      status,
      hasNotes: !!resolutionNotes,
    })

    // Validate input
    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, error: 'reportId and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = [
      'pending',
      'assigned',
      'in_progress',
      'resolved',
      'rejected',
      'closed',
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Get service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Update report status
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey,
    )

    const updateData: any = { status }

    // If status is 'completed' or 'closed', set resolved_at
    if (status === 'completed' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString()
    }

    // Add resolution notes if provided
    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes
    }

    const { data: updatedReport, error: updateError } = await db
      .from('reports')
      .update(updateData)
      .eq('report_id', reportId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Update error:', updateError.message)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update report',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    console.log(`✅ Report ${reportId} status updated to: ${status}`)

    // Create audit trail
    try {
      await db.from('report_updates').insert({
        report_id: reportId,
        updated_by: auth.userRecord?.user_id,
        old_status: 'unknown',
        new_status: status,
        comments: resolutionNotes || null,
        update_type: 'status_change',
      })
    } catch (auditError) {
      console.warn('⚠️ Failed to create audit trail:', auditError)
    }

    return NextResponse.json(
      {
        success: true,
        message: `Report status updated to ${status}`,
        report: updatedReport,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}