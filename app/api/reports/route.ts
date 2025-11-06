/**
 * ===================================
 * FILE PATH: app/api/reports/route.ts
 * 
 * CRITICAL FIX: 
 * - auth.users.id is UUID (Supabase Auth)
 * - public.users.user_id is INTEGER (internal ID)
 * - reports.user_id is INTEGER
 * - Must convert UUID → INTEGER via public.users table
 * ===================================
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
 * Fetches reports created by the signed-in user ONLY.
 * 
 * KEY FIX: auth_id (UUID) → user_id (INTEGER)
 * 1. Extract Bearer token from Authorization header
 * 2. Get Supabase auth user (UUID)
 * 3. Look up internal user_id (INTEGER) from public.users table
 * 4. Filter reports by internal user_id
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    console.log("📖 [GET /api/reports] Request received");
    console.log("   ├─ Status filter:", status || "all");

    // ==================== STEP 1: GET BEARER TOKEN ====================
    const authHeader = req.headers.get("Authorization");
    console.log("🔐 [GET /api/reports] Authorization header:", authHeader ? "✅ found" : "❌ not found");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ [GET /api/reports] No Bearer token in Authorization header");
      return NextResponse.json(
        { success: false, error: "User not authenticated - no Bearer token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("   └─ Token extracted:", `${token.substring(0, 20)}...`);

    // ==================== STEP 2: GET AUTH USER (UUID) ====================
    const authSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    console.log("🔑 [GET /api/reports] Auth verification:");
    console.log("   ├─ Auth user (UUID):", authUser ? `✅ ${authUser.id}` : "❌ Not found");
    if (authError) {
      console.error("   └─ Auth error:", authError.message);
    }

    if (!authUser) {
      console.error("❌ [GET /api/reports] User not authenticated:", authError?.message);
      return NextResponse.json(
        { success: false, error: "User not authenticated", details: authError?.message },
        { status: 401 }
      );
    }

    // ==================== STEP 3: CONVERT UUID → INTEGER USER_ID ====================
    // Look up the internal user_id (INTEGER) using auth_id (UUID)
    console.log("🔄 [GET /api/reports] Looking up internal user_id from public.users...");

    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("auth_id", authUser.id)
      .single();

    console.log("   ├─ Lookup result:");
    console.log("   ├─ Auth ID (UUID):", authUser.id);
    console.log("   ├─ Internal user_id (INTEGER):", userRecord?.user_id || "❌ Not found");
    if (userError) {
      console.error("   └─ Lookup error:", userError.message);
    }

    if (!userRecord) {
      console.error("❌ [GET /api/reports] User record not found in public.users table");
      return NextResponse.json(
        { 
          success: false, 
          error: "User profile not found", 
          details: `No user record found for auth_id: ${authUser.id}`,
          authId: authUser.id 
        },
        { status: 404 }
      );
    }

    const internalUserId = userRecord.user_id;
    console.log(`✅ [GET /api/reports] User authenticated: ${authUser.id} → internal ID: ${internalUserId}`);

    // ==================== STEP 4: BUILD QUERY WITH USER FILTER ====================
    console.log("📋 [GET /api/reports] Building query...");

    let query = supabase
      .from("vw_user_report_detail")
      .select(`
        report_id,
        user_id,
        report_type,
        description,
        status,
        priority,
        created_at,
        resolved_at,
        users:user_id(id, full_name, email),
        locations:location_id(id, name, latitude, longitude)
      `)
      .eq("user_id", internalUserId)  // ← FILTER: Only this user's reports (INTEGER)
      .order("created_at", { ascending: false });

    console.log(`   └─ Filtering by user_id: ${internalUserId}`);

    // ==================== STEP 5: APPLY STATUS FILTER IF PROVIDED ====================
    if (status && status !== "all") {
      query = query.eq("status", status);
      console.log("   └─ Additional status filter:", status);
    }

    // ==================== STEP 6: EXECUTE QUERY ====================
    const { data, error } = await query;

    if (error) {
      console.error("❌ [GET /api/reports] Query error:", error.message);
      console.error("   └─ Full error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [GET /api/reports] Query executed - found ${data?.length || 0} report(s)`);

    // ==================== STEP 7: FORMAT RESPONSE ====================
    const formatted = data?.map((r: any) => ({
      report_id: r.report_id,
      user_id: r.user_id,
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
    })) || [];

    return NextResponse.json({
      success: true,
      authenticated_user_auth_id: authUser.id,  // Debug: Supabase auth ID
      authenticated_user_id: internalUserId,     // Debug: Internal user ID
      count: formatted.length,
      data: formatted,
    });
  } catch (error: any) {
    console.error("❌ [GET /api/reports] Exception:", error);
    console.error("   └─ Stack:", error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}