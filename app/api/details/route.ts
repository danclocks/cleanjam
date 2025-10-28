/**
 * ================================================================
 * FILE PATH: app/api/reports/details/route.ts
 * 
 * ROUTE LINKS:
 * - GET /api/reports/details              → All reports from view
 * - GET /api/reports/details?user_id=X    → Reports for specific user
 * - GET /api/reports/details?status=X     → Reports filtered by status
 * ================================================================
 * 
 * Fetches detailed reports from Supabase view:
 *   public.vw_user_report_detail (or vw_user_report_details - plural)
 * 
 * Maps view columns to ReportView interface:
 *   - report_id (or id)
 *   - report_type (or type)
 *   - description
 *   - status
 *   - priority
 *   - created_at
 *   - resolved_at
 *   - location_name (or location)
 *   - latitude (or lat)
 *   - longitude (or lng)
 *   - reporter_name (or user_name, full_name)
 *   - reporter_email (or user_email, email)
 * 
 * Accepts query parameters:
 *   - user_id: Filter by user
 *   - status: Filter by status (pending, assigned, in_progress, completed, resolved)
 * ================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type matching page.tsx expectations
interface ReportView {
  report_id: string;
  report_type: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  reporter_name: string;
  reporter_email: string;
}

/**
 * Maps view columns to ReportView interface
 * Handles multiple possible column name variations
 */
function mapViewToReportView(viewData: any): ReportView {
  return {
    report_id: viewData.report_id || viewData.id,
    report_type: viewData.report_type || viewData.type || "unknown",
    description: viewData.description || "",
    status: viewData.status || "unknown",
    priority: viewData.priority || "medium",
    created_at: viewData.created_at || new Date().toISOString(),
    resolved_at: viewData.resolved_at || null,
    location_name: viewData.location_name || viewData.location || "Unknown",
    latitude: viewData.latitude || viewData.lat || null,
    longitude: viewData.longitude || viewData.lng || null,
    reporter_name: viewData.reporter_name || viewData.user_name || viewData.full_name || "Unknown",
    reporter_email: viewData.reporter_email || viewData.user_email || viewData.email || "N/A",
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log("📖 [GET /api/reports/details] Request received");
    
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const status = searchParams.get("status");

    console.log("   ├─ Params:", { user_id, status });

    // Try to query the view - handle both singular and plural names
    let query = supabase.from("vw_user_report_detail").select("*");

    if (user_id) {
      console.log("   ├─ Filtering by user_id:", user_id);
      query = query.eq("user_id", user_id);
    }

    if (status) {
      console.log("   ├─ Filtering by status:", status);
      query = query.eq("status", status);
    }

    console.log("   └─ Executing query...");

    const { data, error } = await query;

    // Log the raw response for debugging
    console.log("   ├─ Raw response count:", data?.length || 0);
    if (error) {
      console.error("   ├─ Supabase error:", error.message);
      console.error("   ├─ Error code:", error.code);
      console.error("   └─ Full error:", error);
    }

    if (error) {
      // Check if it's a view not found error
      if (error.message.includes("relation") || error.code === "PGRST116") {
        console.error("❌ View might not exist or has different name");
        return NextResponse.json(
          {
            success: false,
            message: "View not found. Check that 'vw_user_report_detail' exists in Supabase.",
            error: error.message,
            debug: {
              viewName: "vw_user_report_detail",
              suggestion: "Verify view exists: SELECT * FROM information_schema.views WHERE table_name='vw_user_report_detail'",
            },
          },
          { status: 500 }
        );
      }

      throw new Error(`Supabase query failed: ${error.message}`);
    }

    // Validate data exists
    if (!data || !Array.isArray(data)) {
      console.warn("⚠️ [GET /api/reports/details] No data returned from view");
      return NextResponse.json([]);
    }

    console.log(`   ├─ Mapping ${data.length} rows to ReportView interface`);

    // Map all rows to ReportView interface
    const mapped: ReportView[] = data.map((row, idx) => {
      try {
        const mapped = mapViewToReportView(row);
        // Validate required fields
        if (!mapped.report_id) {
          throw new Error("Missing report_id in mapped data");
        }
        return mapped;
      } catch (mapError: any) {
        console.error(`   ├─ Error mapping row ${idx}:`, mapError.message);
        throw mapError;
      }
    });

    console.log(`✅ [GET /api/reports/details] Successfully mapped ${mapped.length} reports`);

    return NextResponse.json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (err: any) {
    console.error("❌ [GET /api/reports/details] Exception caught:", err.message);
    console.error("   └─ Full error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch reports",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}