// ================================================================
// FILE PATH: app/api/admin/dashboard/route.ts
// LOCATION: Must be at: app/api/admin/dashboard/route.ts
// PURPOSE: Admin Dashboard API - returns ALL reports
// KEY: Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
// ================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client - bypasses RLS policies
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("📍 [API] GET /api/admin/dashboard");
    console.log("═══════════════════════════════════════════════════════");

    // STEP 1: Extract Bearer token from Authorization header
    console.log("\n[STEP 1] Extracting Authorization token...");
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing Authorization header");
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log("✅ Token extracted");

    // STEP 2: Decode JWT to get user_id (from token sub claim)
    console.log("\n[STEP 2] Decoding JWT token...");
    let authUserId: string;
    
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const decoded = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );
      
      authUserId = decoded.sub;
      console.log("✅ JWT decoded");
      console.log("   Auth ID (UUID):", authUserId);
    } catch (decodeError) {
      console.error("❌ Failed to decode JWT:", (decodeError as any).message);
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    if (!authUserId) {
      console.error("❌ No user ID in JWT");
      return NextResponse.json(
        { error: "Invalid token - no user ID" },
        { status: 401 }
      );
    }

    // STEP 3: Fetch user record from database
    console.log("\n[STEP 3] Fetching user record from database...");
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from("users")
      .select("user_id, email, full_name, role, is_active, avatar_url")
      .eq("auth_id", authUserId)
      .single();

    if (userError || !userRecord) {
      console.error("❌ User not found:", userError?.message);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ User found");
    console.log("   Internal user_id (INTEGER):", userRecord.user_id);
    console.log("   Role:", userRecord.role);

    // STEP 4: Verify admin role
    console.log("\n[STEP 4] Verifying admin role...");
    const role = userRecord.role as string;

    if (role !== "admin" && role !== "supadmin") {
      console.error("❌ Access denied - role:", role);
      return NextResponse.json(
        { error: "Forbidden - admin required", userRole: role },
        { status: 403 }
      );
    }

    console.log("✅ Admin verified");

    // STEP 5: Fetch ALL reports from view
    console.log("\n[STEP 5] Fetching ALL reports from vw_user_report_detail...");
    
    const { data: allReports, error: reportsError } = await supabaseAdmin
      .from("vw_user_report_detail")
      .select("*")
      .order("user_created_at", { ascending: false })
      .limit(100);

    if (reportsError) {
      console.error("❌ Reports error:", reportsError.message);
      return NextResponse.json(
        { error: "Failed to fetch reports", details: reportsError.message },
        { status: 500 }
      );
    }

    console.log("✅ Reports fetched:", allReports?.length || 0);

    // STEP 6: Format reports
    console.log("\n[STEP 6] Formatting reports...");
    const formattedReports = (allReports || []).map((r: any) => ({
      report_id: r.report_id,
      location_community: r.location_community || "Unknown",
      report_type: r.report_type,
      status: r.status,
      priority: r.priority,
      user_created_at: r.user_created_at,
      reporter_name: r.full_name || "Unknown",
      reporter_email: r.email || "N/A",
    }));

    console.log("✅ Formatted:", formattedReports.length);

    // STEP 7: Calculate statistics
    console.log("\n[STEP 7] Calculating statistics...");
   const stats = {
  totalReports: formattedReports.length,
  resolvedReports: formattedReports.filter(
    (r) => r.status === "resolved" || r.status === "closed"
  ).length,
  inProgressReports: formattedReports.filter(
    (r) => r.status === "in_progress" || r.status === "assigned"
  ).length,
  pendingReports: formattedReports.filter((r) => r.status === "pending")
    .length,
  rejectedReports: formattedReports.filter((r) => r.status === "rejected")
    .length,
};

    console.log("✅ Stats calculated:", stats);

    // STEP 8: Build charts data
    console.log("\n[STEP 8] Building charts...");
    const charts = {
  reportStatusData: [
    { name: "Resolved", value: stats.resolvedReports, color: "#10b981" },
    {
      name: "In Progress",
      value: stats.inProgressReports,
      color: "#3b82f6",
    },
    { name: "Pending", value: stats.pendingReports, color: "#f59e0b" },
    { name: "Rejected", value: stats.rejectedReports, color: "#ef4433" },
  ],
  priorityBreakdown: [
    {
      name: "Urgent",
      value: formattedReports.filter((r) => r.priority === "urgent")
        .length,
      color: "#ef4444",
    },
    {
      name: "High",
      value: formattedReports.filter((r) => r.priority === "high").length,
      color: "#f97316",
    },
    {
      name: "Medium",
      value: formattedReports.filter((r) => r.priority === "medium")
        .length,
      color: "#eab308",
    },
    {
      name: "Low",
      value: formattedReports.filter((r) => r.priority === "low").length,
      color: "#22c55e",
    },
  ],
  reportTypeBreakdown: formattedReports.reduce(
    (acc, report) => {
      const existing = acc.find((r) => r.type === report.report_type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: report.report_type, count: 1 });
      }
      return acc;
    },
    [] as { type: string; count: number }[]
  ),
};

    console.log("✅ Charts built");

    // STEP 9: Build response
    console.log("\n[STEP 9] Building response...");
    const responseData = {
      success: true,
      admin: {
        user_id: userRecord.user_id,
        email: userRecord.email,
        full_name: userRecord.full_name || "Admin User",
        role: role as "admin" | "supadmin",
        avatar: (userRecord.full_name || "A")[0]?.toUpperCase() || "A",
      },
      statistics: stats,
      reports: formattedReports,
      charts: charts,
    };

    console.log("✅ Response built");
    console.log("═══════════════════════════════════════════════════════");
    console.log("🟢 SUCCESS - Returning 200");
    console.log("═══════════════════════════════════════════════════════\n");

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("\n");
    console.error("❌ EXCEPTION CAUGHT");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("═══════════════════════════════════════════════════════\n");

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}