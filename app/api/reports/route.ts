/**
 * ===================================
 * FILE PATH: app/api/reports/route.ts
 * ===================================
 * 
 * API routes for report CRUD operations
 * POST: Create new report
 * GET: Fetch all user reports
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ==================== POST - CREATE REPORT ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      location_id,
      report_type,
      description,
      priority,
      photos,
    } = body;

    // Validate required fields
    if (!user_id || !location_id || !report_type || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create report in database
    const { data, error } = await supabase
      .from("report")
      .insert({
        user_id,
        location_id,
        report_type,
        description,
        priority: priority || "medium",
        status: "pending",
        photos: photos || [],
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Report creation error:", error);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ==================== GET - FETCH ALL USER REPORTS ====================

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");
    const status = request.nextUrl.searchParams.get("status");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from("report")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Fetch reports error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}