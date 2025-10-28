/**
 * ===================================
 * FILE: app/api/location/route.ts
 * ===================================
 * Handles CRUD operations for Location with Admin authorization
 * Only users with "Admin" role can create, update, or delete locations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service key for server-side ops
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* ============================================================
   Helper: Verify Admin Role
   ============================================================ */
async function verifyAdmin(req: NextRequest) {
  try {
    const accessToken = req.headers.get('Authorization')?.replace('Bearer ', '')

    if (!accessToken) {
      throw new Error('Missing access token')
    }

    // Get user from token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      throw new Error('Invalid or expired token')
    }

    // Check if user exists in Admin table
    const { data: admin, error: adminError } = await supabase
      .from('Admin')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (adminError || !admin) {
      throw new Error('User is not registered as Admin')
    }

    if (admin.role.toLowerCase() !== 'super admin' && admin.role.toLowerCase() !== 'admin') {
      throw new Error('Insufficient privileges')
    }

    return user
  } catch (error: any) {
    throw new Error(error.message || 'Unauthorized access')
  }
}

/* ============================================================
   POST → Create new location (Admin only)
   ============================================================ */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const { name, parish, coordinates } = await req.json()

    const { data, error } = await supabase
      .from('location')
      .insert([{ name, parish, coordinates }])
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('❌ [POST] location:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }
}

/* ============================================================
   GET → Anyone can view all or one location
   ============================================================ */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    const query = supabase.from('location').select('*').order('created_at', { ascending: false })
    if (id) query.eq('location_id', id)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('❌ [GET] location:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

/* ============================================================
   PUT → Update location (Admin only)
   ============================================================ */
export async function PUT(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const { location_id, name, parish, coordinates } = await req.json()

    if (!location_id) throw new Error('Missing location_id')

    const { data, error } = await supabase
      .from('location')
      .update({ name, parish, coordinates })
      .eq('location_id', location_id)
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('❌ [PUT] location:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }
}

/* ============================================================
   DELETE → Delete location (Admin only)
   ============================================================ */
export async function DELETE(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) throw new Error('Missing id')

    const { error } = await supabase.from('location').delete().eq('location_id', id)
    if (error) throw error

    return NextResponse.json({ success: true, message: 'location deleted successfully' })
  } catch (error: any) {
    console.error('❌ [DELETE] location:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }
}
