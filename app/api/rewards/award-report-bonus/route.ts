/**
 * ================================================================
 * FILE PATH: app/api/rewards/award-report-bonus/route.ts
 * CREATED: November 6, 2025
 * 
 * AWARD POINTS FOR RESOLVED REPORTS
 * 
 * POST /api/rewards/award-report-bonus
 * Awards 25-100 points based on report priority when marked complete.
 * 
 * Request body:
 * {
 *   user_id: number,
 *   report_id: number,
 *   priority: 'critical' | 'high' | 'medium' | 'low',
 *   resolved_by: number (admin user_id)
 * }
 * 
 * Response: { success, points_awarded, transaction_id, new_balance }
 * ================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Point values by priority
const POINT_VALUES: Record<string, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, report_id, priority, resolved_by } = body;

    // Validate inputs
    if (!user_id || !report_id || !priority) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: user_id, report_id, priority",
        },
        { status: 400 }
      );
    }

    if (!POINT_VALUES[priority]) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid priority. Must be: critical, high, medium, or low`,
        },
        { status: 400 }
      );
    }

    console.log("🎁 Award Report Bonus - Starting...");
    console.log(`   User ID: ${user_id}`);
    console.log(`   Report ID: ${report_id}`);
    console.log(`   Priority: ${priority}`);

    // Step 1: Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id, email, full_name")
      .eq("user_id", user_id)
      .single();

    if (userError || !userData) {
      console.error("❌ User not found:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log(`✅ User found: ${userData.email}`);

    // Step 2: Check if report exists
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select("report_id, report_type, priority, status, user_id")
      .eq("report_id", report_id)
      .single();

    if (reportError || !reportData) {
      console.error("❌ Report not found:", reportError);
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Report found: ${reportData.report_type}`);

    // Step 3: Check if user already received bonus for this report
    const { data: existingTx, error: existingError } = await supabase
      .from("rewards_points_transactions")
      .select("transaction_id")
      .eq("user_id", user_id)
      .eq("related_report_id", report_id)
      .eq("transaction_type", "report_resolved")
      .single();

    if (existingTx) {
      console.log("ℹ️  Bonus already awarded for this report");
      return NextResponse.json(
        {
          success: true,
          message: "Bonus already awarded for this report",
          points_awarded: 0,
          transaction_id: existingTx.transaction_id,
          already_awarded: true,
        },
        { status: 200 }
      );
    }

    // Step 4: Initialize user_rewards if not exists
    await supabase.rpc("fn_init_user_rewards", { p_user_id: user_id });

    // Step 5: Calculate points based on priority
    const pointsToAward = POINT_VALUES[priority];
    console.log(`   Points to award: ${pointsToAward}`);

    // Step 6: Create transaction for report resolution
    const { data: transactionData, error: transactionError } = await supabase
      .from("rewards_points_transactions")
      .insert({
        user_id: user_id,
        points_amount: pointsToAward,
        transaction_type: "report_resolved",
        related_report_id: report_id,
        description: `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority report resolved (${reportData.report_type})`,
        status: "completed",
        processed_by: resolved_by || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError || !transactionData) {
      console.error("❌ Transaction creation failed:", transactionError);
      return NextResponse.json(
        { success: false, error: "Failed to award points" },
        { status: 500 }
      );
    }

    console.log(`✅ Transaction created: ${transactionData.transaction_id}`);

    // Step 7: Get updated balance (triggers will auto-update)
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("user_rewards")
      .select("current_points_balance, lifetime_points_earned")
      .eq("user_id", user_id)
      .single();

    if (rewardsError) {
      console.warn("⚠️  Could not fetch updated balance:", rewardsError);
    }

    console.log("✅ Report bonus awarded successfully!");
    console.log(`   New balance: ${rewardsData?.current_points_balance || 0} points`);
    console.log(`   Lifetime earned: ${rewardsData?.lifetime_points_earned || 0} points`);

    return NextResponse.json(
      {
        success: true,
        message: `${pointsToAward} points awarded for resolved report!`,
        points_awarded: pointsToAward,
        transaction_id: transactionData.transaction_id,
        new_balance: rewardsData?.current_points_balance || 0,
        already_awarded: false,
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
 * INTEGRATION: How to call this from admin report update
 * ================================================================
 * 
 * In your PUT /api/admin/reports/[id]/route.ts
 * or wherever you mark reports as completed:
 * 
 * if (newStatus === "completed") {
 *   const bonusRes = await fetch(
 *     new URL("/api/rewards/award-report-bonus", request.url),
 *     {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({
 *         user_id: report.user_id,
 *         report_id: report.report_id,
 *         priority: report.priority,
 *         resolved_by: adminUserId
 *       }),
 *     }
 *   );
 * 
 *   const bonusData = await bonusRes.json();
 *   console.log(`Points awarded: ${bonusData.points_awarded}`);
 * }
 * 
 * POINT VALUES:
 * - Critical: 100 points
 * - High:     75 points
 * - Medium:   50 points
 * - Low:      25 points
 */