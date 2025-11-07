/**
 * ================================================================
 * FILE PATH: app/api/admin/rewards/stats/route.ts
 * CREATED: November 7, 2025
 * 
 * GET ADMIN REWARDS STATISTICS
 * 
 * GET /api/admin/rewards/stats
 * 
 * Returns aggregate rewards data for admin dashboard:
 * - Total points awarded system-wide
 * - Total points redeemed
 * - Pending redemptions count
 * - Total JMD paid out
 * 
 * Requires: Admin or Supadmin role
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
    // Extract auth token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ [STATS] Missing or invalid authorization header");
      return NextResponse.json(
        { success: false, error: "Missing authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    console.log("🔐 [STATS] Verifying admin authorization...");

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("❌ [STATS] Token verification failed:", userError?.message);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("✅ [STATS] User verified:", user.email);

    // Step 1: Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from("users")
      .select("user_id, email, role")
      .eq("auth_id", user.id)
      .single();

    if (adminError || !adminData) {
      console.error("❌ [STATS] Admin user not found:", adminError?.message);
      return NextResponse.json(
        { success: false, error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check role
    if (!["admin", "supadmin"].includes(adminData.role || "")) {
      console.error("❌ [STATS] User is not an admin");
      return NextResponse.json(
        { success: false, error: "Only admins can view rewards statistics" },
        { status: 403 }
      );
    }

    console.log(`✅ [STATS] Admin verified: ${adminData.email} (${adminData.role})`);

    // ========== CALCULATE REWARDS STATS ==========
    console.log("📊 [STATS] Calculating rewards statistics...");

    // Get total points awarded (all completed transactions that added points)
    const { data: awardedTx, error: awardedError } = await supabase
      .from("rewards_points_transactions")
      .select("points_amount")
      .in("transaction_type", ["report_resolved", "signup_bonus", "achievement_bonus"])
      .eq("status", "completed");

    if (awardedError) {
      console.warn("⚠️ [STATS] Error fetching awarded transactions:", awardedError);
    }

    const total_points_awarded = (awardedTx || []).reduce(
      (sum, tx) => sum + Math.abs(tx.points_amount),
      0
    );

    console.log(`✅ [STATS] Total points awarded: ${total_points_awarded}`);

    // Get total points redeemed (completed redemptions)
    const { data: redeemedTx, error: redeemedError } = await supabase
      .from("rewards_points_transactions")
      .select("points_amount")
      .eq("transaction_type", "redemption_approved")
      .eq("status", "completed");

    if (redeemedError) {
      console.warn("⚠️ [STATS] Error fetching redeemed transactions:", redeemedError);
    }

    const total_points_redeemed = (redeemedTx || []).reduce(
      (sum, tx) => sum + Math.abs(tx.points_amount),
      0
    );

    console.log(`✅ [STATS] Total points redeemed: ${total_points_redeemed}`);

    // Get pending redemptions count
    const { data: pendingTx, error: pendingError, count: pendingCount } = await supabase
      .from("rewards_points_transactions")
      .select("*", { count: "exact" })
      .eq("transaction_type", "redemption_approved")
      .eq("status", "pending");

    if (pendingError) {
      console.warn("⚠️ [STATS] Error fetching pending transactions:", pendingError);
    }

    const pending_redemptions = pendingCount || 0;

    console.log(`✅ [STATS] Pending redemptions: ${pending_redemptions}`);

    // Calculate total JMD paid out (completed redemptions / 1 since 1 point = 1 JMD)
    const total_jmd_paid_out = total_points_redeemed / 1;

    console.log(`✅ [STATS] Total JMD paid out: $${total_jmd_paid_out}`);

    // Get additional context
    const { data: userRewardStats } = await supabase
      .from("user_rewards")
      .select("current_points_balance, lifetime_points_earned, total_points_redeemed");

    const totalUsersWithRewards = userRewardStats?.length || 0;
    console.log(`✅ [STATS] Total users with rewards: ${totalUsersWithRewards}`);

    console.log("✅ [STATS] Rewards statistics calculated successfully");

    return NextResponse.json(
      {
        success: true,
        total_points_awarded,
        total_points_redeemed,
        pending_redemptions,
        total_jmd_paid_out,
        total_users_with_rewards: totalUsersWithRewards,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [STATS] Unexpected error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * ================================================================
 * EXAMPLE RESPONSE
 * ================================================================
 * 
 * {
 *   "success": true,
 *   "total_points_awarded": 5250,
 *   "total_points_redeemed": 1500,
 *   "pending_redemptions": 3,
 *   "total_jmd_paid_out": 1500,
 *   "total_users_with_rewards": 42,
 *   "timestamp": "2025-11-07T12:34:56.789Z"
 * }
 * 
 * ================================================================
 * INTEGRATION: Called from admin dashboard
 * ================================================================
 * 
 * const response = await fetch("/api/admin/rewards/stats", {
 *   method: "GET",
 *   credentials: "include",
 *   headers: {
 *     "Authorization": `Bearer ${session.access_token}`,
 *   },
 * });
 * 
 * const stats = await response.json();
 * setRewardsStats(stats);
 */