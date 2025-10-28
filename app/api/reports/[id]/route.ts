/**
 * ================================================================
 * FILE PATH: app/api/reports/[id]/route.ts
 * 
 * ROUTE LINKS:
 * - GET /api/reports/[id]     → Fetch single report by ID
 * ================================================================
 * 
 * Fetches a single report by ID from Supabase view (vw_user_report_detail)
 * 
 * IMPORTANT: Next.js 15+ requires `params` to be awaited!
 * This route properly handles async params
 * 
 * CleanJamaica Dashboard 2025
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ReportDetail {
  user_id: string;
  auth_id: string;
  report_id: string;
  report_type: string;
  description: string;
  status: string;
  priority: string;
  submitted_at: string;
  resolved_at: string | null;
  location_id: string;
  location_street: string;
  location_community: string;
  location_parish: string;
  report_latitude: number | null;
  report_longitude: number | null;
  location_latitude: number | null;
  location_longitude: number | null;
  full_name: string;
  email: string;
  username: string;
  avatar_url: string | null;
  photo_urls: string[] | null;
  photo_filepaths: string[] | null;
  report_street: string;
  report_community: string;
}

/**
 * GET /api/reports/[id]
 * Fetches a single report with all details from vw_user_report_detail
 * 
 * ✅ FIXED: Properly handles async params in Next.js 15+
 * ✅ FIXED: Queries denormalized view columns directly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is Promise
) {
  try {
    console.log("📖 [GET /api/reports/[id]] Request received");

    // ✅ FIXED: Must await params before accessing
    const { id } = await params;

    console.log("   ├─ Report ID:", id);

    // ==================== VALIDATION ====================
    if (!id) {
      console.warn("⚠️ [GET /api/reports/[id]] Missing report ID");
      return NextResponse.json(
        { success: false, error: "Missing report ID" },
        { status: 400 }
      );
    }

    // ==================== FETCH REPORT ====================
    console.log("   └─ Fetching report from vw_user_report_detail view...");

    const { data, error } = await supabase
      .from("vw_user_report_detail")
      .select(`
        report_id,
        user_id,
        auth_id,
        report_type,
        description,
        status,
        priority,
        submitted_at,
        resolved_at,
        location_id,
        location_street,
        location_community,
        location_parish,
        report_latitude,
        report_longitude,
        location_latitude,
        location_longitude,
        full_name,
        email,
        username,
        avatar_url,
        photo_urls,
        photo_filepaths,
        report_street,
        report_community
      `)
      .eq("report_id", id)
      .single();

    if (error) {
      console.error("❌ [GET /api/reports/[id]] Database error:", error.message);

      // Handle "no rows returned" error
      if (error.code === "PGRST116") {
        console.error("   └─ Report not found with ID:", id);
        return NextResponse.json(
          { success: false, error: "Report not found" },
          { status: 404 }
        );
      }

      throw error;
    }

    if (!data) {
      console.error("❌ [GET /api/reports/[id]] No data returned for ID:", id);
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    console.log("   ├─ Report found:", data.report_id);

    // ==================== MAP RESPONSE ====================
    const mapped: ReportDetail = {
      user_id: data.user_id,
      auth_id: data.auth_id,
      report_id: data.report_id,
      report_type: data.report_type,
      description: data.description,
      status: data.status,
      priority: data.priority,
      submitted_at: data.submitted_at,
      resolved_at: data.resolved_at,
      location_id: data.location_id,
      location_street: data.location_street || "N/A",
      location_community: data.location_community || "N/A",
      location_parish: data.location_parish || "N/A",
      report_latitude: data.report_latitude || null,
      report_longitude: data.report_longitude || null,
      location_latitude: data.location_latitude || null,
      location_longitude: data.location_longitude || null,
      full_name: data.full_name || "Unknown",
      email: data.email || "N/A",
      username: data.username || "Unknown",
      avatar_url: data.avatar_url || null,
      photo_urls: data.photo_urls || null,
      photo_filepaths: data.photo_filepaths || null,
      report_street: data.report_street || "N/A",
      report_community: data.report_community || "N/A",
    };

    console.log("✅ [GET /api/reports/[id]] Successfully retrieved report");

    return NextResponse.json({
      success: true,
      data: mapped,
    });
  } catch (error: any) {
    console.error("❌ [GET /api/reports/[id]] Exception caught:", error.message);
    console.error("   └─ Full error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch report",
      },
      { status: 500 }
    );
  }
}