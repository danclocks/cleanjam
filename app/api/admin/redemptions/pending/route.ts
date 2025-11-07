/**
 * ================================================================
 * FILE PATH: app/api/admin/redemptions/pending/route.ts
 * CREATED: November 6, 2025
 * 
 * GET PENDING REDEMPTION REQUESTS (ADMIN ONLY)
 * 
 * GET /api/admin/redemptions/pending?admin_auth_id=UUID&limit=50&offset=0
 * 
 * Query params:
 *   - admin_auth_id (required) - Admin's Supabase auth ID
 *   - limit (optional, default: 50)
 *   - offset (optional, default: 0)
 *   - status (optional: pending, completed, failed)
 * 
 * Response: { success, redemptions, totalCount, pagination }
 * 
 * Returns paginated list of redemption requests for admin review
 * ================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const admin_auth_id = searchParams.get("admin_auth_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || "pending";

    // Validate admin auth_id
    if (!admin_auth_id) {
      return NextResponse.json(
        { success: false, error: "Missing admin_auth_id parameter" },
        { status: 400 }
      );
    }

    console.log("👤 Get Pending Redemptions - Starting...");
    console.log(`   Admin Auth ID: ${admin_auth_id}`);
    console.log(`   Status filter: ${status}`);

    // Step 1: Verify admin user
    const { data: adminData, error: adminError } = await supabase
      .from("users")
      .select("user_id, email, role")
      .eq("auth_id", admin_auth_id)
      .single();

    if (adminError || !adminData) {
      console.error("❌ Admin user not found:", adminError);
      return NextResponse.json(
        { success: false, error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check if user has admin role
    if (!["admin", "supadmin"].includes(adminData.role || "")) {
      console.error("❌ User is not an admin");
      return NextResponse.json(
        { success: false, error: "Only admins can view redemptions" },
        { status: 403 }
      );
    }

    console.log(`✅ Admin verified: ${adminData.email}`);

    // Step 2: Query pending redemptions
    let query = supabase
      .from("rewards_points_transactions")
      .select(
        `
        transaction_id,
        user_id,
        points_amount,
        transaction_type,
        description,
        status,
        created_at,
        users:user_id (
          email,
          full_name,
          community
        )
      `,
        { count: "exact" }
      )
      .eq("transaction_type", "redemption_approved")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: redemptions, error: queryError, count } = await query;

    if (queryError) {
      console.error("❌ Query failed:", queryError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch redemptions" },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${redemptions?.length || 0} redemptions`);
    console.log(`   Total pending: ${count || 0}`);

    // Step 3: Format response
    const formattedRedemptions = (redemptions || []).map((tx) => ({
      transaction_id: tx.transaction_id,
      user_id: tx.user_id,
      user_email: tx.users?.[0]?.email || "Unknown",
      user_name: tx.users?.[0]?.full_name || "Unknown",
      user_community: tx.users?.[0]?.community || "N/A",
      points_amount: Math.abs(tx.points_amount), // Show as positive
      jmd_amount: Math.abs(tx.points_amount) / 500,
      description: tx.description,
      status: tx.status,
      requested_date: new Date(tx.created_at).toLocaleDateString(),
      requested_time: new Date(tx.created_at).toLocaleTimeString(),
      timestamp: tx.created_at,
    }));

    return NextResponse.json(
      {
        success: true,
        redemptions: formattedRedemptions,
        totalCount: count || 0,
        pagination: {
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0),
        },
        summary: {
          total_pending: status === "pending" ? count : 0,
          total_approved: status === "completed" ? count : 0,
          total_rejected: status === "failed" ? count : 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * ================================================================
 * INTEGRATION: How to use in admin redemptions page
 * ================================================================
 * 
 * 1. Fetch pending redemptions on page load:
 * useEffect(() => {
 *   const fetchPending = async () => {
 *     const response = await fetch(
 *       `/api/admin/redemptions/pending?admin_auth_id=${adminAuthId}&limit=50&offset=0&status=pending`,
 *       { method: "GET" }
 *     );
 *     const data = await response.json();
 *     setPendingRedemptions(data.redemptions);
 *   };
 *   fetchPending();
 * }, [adminAuthId]);
 * 
 * 2. Display table of pending redemptions:
 * | User | Email | Points | JMD | Requested | Action |
 * |------|-------|--------|-----|-----------|--------|
 * | John | john@x| 1000   | 2000| 2 hrs ago | Approve/Reject |
 * 
 * 3. When user clicks Approve/Reject:
 * const response = await fetch(
 *   "/api/admin/redemptions/approve",
 *   {
 *     method: "PUT",
 *     body: JSON.stringify({
 *       admin_auth_id: adminAuthId,
 *       transaction_id: tx.transaction_id,
 *       action: "approve"
 *     })
 *   }
 * );
 * 
 * 4. Refresh the list after approval
 * 
 * STATUS OPTIONS:
 * - pending: Awaiting admin approval
 * - completed: Approved and processed
 * - failed: Rejected by admin
 */