/**
 * ===================================
 * FILE PATH: app/api/reports/route.ts
 * 
 * ROUTE LINKS:
 * - POST  /api/reports          → Create a new garbage report
 * - GET   /api/reports          → Fetch all reports (with filters)
 * - GET   /api/reports?status=X → Fetch reports filtered by status
 * ===================================
 *
 * API endpoint for:
 * 1. POST: Create a new garbage report with photo uploads
 * 2. GET: Fetch all reports with joined user + location info
 * 
 * Tables joined:
 *   - reports (main)
 *   - users (join on user_id → get reporter info)
 *   - locations (join on location_id → get coordinates & address)
 * 
 * CleanJamaica Dashboard 2025
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==================== POST HANDLER ====================
/**
 * POST /api/reports
 * Creates a new garbage report with photo uploads to Supabase storage
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📮 [POST /api/reports] Request received");
    console.log("   ├─ Method:", request.method);
    console.log("   ├─ URL:", request.url);
    console.log("   └─ Content-Type:", request.headers.get("content-type"));

    const formData = await request.formData();
    console.log("📦 [POST /api/reports] FormData parsed successfully");

    // Extract form data
    const userId = formData.get("userId") as string;
    const description = formData.get("description") as string;
    const reportType = formData.get("report_type") as string;
    const priority = formData.get("priority") as string;
    const street = formData.get("street") as string;
    const community = formData.get("community") as string;
    const location_id = formData.get("location_id") as string;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;

    console.log("📋 [POST /api/reports] Extracted form fields:");
    console.log("   ├─ userId:", userId);
    console.log("   ├─ description:", description?.substring(0, 50) + "...");
    console.log("   ├─ reportType:", reportType);
    console.log("   ├─ priority:", priority);
    console.log("   ├─ street:", street);
    console.log("   ├─ community:", community);
    console.log("   ├─ location_id:", location_id);
    console.log("   ├─ latitude:", latitude);
    console.log("   └─ longitude:", longitude);

    // ==================== VALIDATION ====================
    const missingFields: string[] = [];

    if (!userId) missingFields.push("userId");
    if (!description) missingFields.push("description");
    if (!reportType) missingFields.push("report_type");
    if (!street) missingFields.push("street");
    if (!community) missingFields.push("community");
    if (!location_id) missingFields.push("location_id");
    if (!latitude) missingFields.push("latitude");
    if (!longitude) missingFields.push("longitude");

    if (missingFields.length > 0) {
      console.error(
        "❌ [POST /api/reports] Missing required fields:",
        missingFields.join(", ")
      );

      return NextResponse.json(
        {
          success: false,
          error: `Missing required field${missingFields.length > 1 ? "s" : ""}: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    // ==================== PHOTOS ====================
    const photoFiles: File[] = [];
    let fileIndex = 0;
    while (true) {
      const file = formData.get(`photos[${fileIndex}]`) as File;
      if (!file) break;
      photoFiles.push(file);
      fileIndex++;
    }

    console.log("📷 [POST /api/reports] Photos found:", photoFiles.length);
    photoFiles.forEach((photo, idx) => {
      console.log(
        `   ├─ Photo ${idx + 1}: ${photo.name} (${photo.size} bytes, type: ${photo.type})`
      );
    });

    if (photoFiles.length === 0) {
      console.error("❌ [POST /api/reports] No photos provided");
      return NextResponse.json(
        { success: false, error: "At least one photo is required" },
        { status: 400 }
      );
    }

    // ==================== UPLOAD PHOTOS ====================
    const photoUrls: string[] = [];
    console.log("⏳ [POST /api/reports] Starting photo uploads to Supabase storage...");

    for (let i = 0; i < photoFiles.length; i++) {
      const photo = photoFiles[i];
      try {
        const buffer = await photo.arrayBuffer();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}-${photo.name}`;
        const filePath = `reports/${userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("reports")
          .upload(filePath, buffer, {
            contentType: photo.type,
          });

        if (uploadError) {
          console.error(`❌ Photo upload failed (${photo.name}):`, uploadError.message);
          return NextResponse.json(
            { success: false, error: `Failed to upload photo: ${uploadError.message}` },
            { status: 500 }
          );
        }

        const { data: publicData } = supabase.storage
          .from("reports")
          .getPublicUrl(filePath);

        photoUrls.push(publicData.publicUrl);
        console.log(`✅ Uploaded photo ${i + 1}: ${publicData.publicUrl}`);
      } catch (error: any) {
        console.error("❌ Error processing photo:", error.message);
        return NextResponse.json(
          { success: false, error: `Error processing photo: ${error.message}` },
          { status: 500 }
        );
      }
    }

    console.log("✅ [POST /api/reports] All photos uploaded successfully");

    // ==================== CREATE REPORT ====================
    console.log("⏳ [POST /api/reports] Creating report in database...");

    const reportData = {
      user_id: userId,
      description,
      report_type: reportType,
      priority,
      street,
      community,
      location_id: location_id || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: "Pending",
      submitted_at: new Date().toISOString(),
    };

    console.log("📊 [POST /api/reports] Report data to insert:", reportData);

    const { data: createdReport, error: reportError } = await supabase
      .from("reports")
      .insert([reportData])
      .select()
      .single();

    if (reportError) {
      console.error("❌ [POST /api/reports] Database insert failed:", reportError.message);
      return NextResponse.json(
        { success: false, error: `Failed to create report: ${reportError.message}` },
        { status: 500 }
      );
    }

    console.log("✅ [POST /api/reports] Report created successfully:", createdReport.report_id);

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully",
        report: createdReport,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ [POST /api/reports] Exception caught:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// ==================== GET HANDLER ====================
/**
 * GET /api/reports
 * GET /api/reports?status=pending
 * 
 * Fetches all reports with joined user and location information.
 * Supports filtering by status via query parameter.
 * 
 * BUG FIX NOTES:
 * - Changed: location:location() → users:users(), locations:locations()
 * - This ensures proper table joins to users and locations tables
 * - Consistent property mapping: r.users and r.locations
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    console.log("📖 [GET /api/reports] Request received");
    console.log("   ├─ Status filter:", status || "all");

    // ✅ FIX: Proper table joins with correct aliases
    let query = supabase
      .from("vw_user_report_details")
      .select(`
        report_id,
        report_type,
        description,
        status,
        priority,
        created_at,
        resolved_at,
        users:user_id(id, full_name, email),
        locations:location_id(id, name, latitude, longitude)
      `)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
      console.log("   └─ Applying status filter:", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ [GET /api/reports] Query error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ [GET /api/reports] Retrieved", data?.length || 0, "reports");

    // ✅ FIX: Consistent property mapping with proper null checks
    const formatted = data.map((r: any) => ({
      report_id: r.report_id,
      report_type: r.report_type,
      description: r.description,
      status: r.status,
      priority: r.priority,
      created_at: r.created_at,
      resolved_at: r.resolved_at,
      reporter_name: r.users?.full_name || "Unknown",
      reporter_email: r.users?.email || "N/A",
      location_name: r.locations?.name || "Unknown",
      latitude: r.locations?.latitude || null,
      longitude: r.locations?.longitude || null,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("❌ [GET /api/reports] Exception:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}