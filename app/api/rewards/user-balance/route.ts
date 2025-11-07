/**
 * ================================================================
 * FILE: app/api/rewards/user-balance/route.ts
 * 
 * GET USER'S CURRENT REWARDS BALANCE & STATS
 * 
 * GET /api/rewards/user-balance?auth_id=UUID
 * 
 * Query params: auth_id (required)
 * Response: { success, user_rewards, latest_activity }
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
    const auth_id = searchParams.get("auth_id");

    if (!auth_id) {
      return NextResponse.json(
        { success: false, error: "Missing auth_id parameter" },
        { status: 400 }
      );
    }

    console.log("📊 Fetching user balance...");
    console.log(`   Auth ID: ${auth_id}`);

    // Query vw_user_rewards_detail view
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("vw_user_rewards_detail")
      .select(
        `
        user_id,
        email,
        full_name,
        current_points_balance,
        lifetime_points_earned,
        total_points_redeemed,
        pending_redemption_points,
        redeemable_jmd,
        latest_transaction_type,
        latest_points_amount,
        latest_transaction_description,
        latest_transaction_date
      `
      )
      .eq("auth_id", auth_id)
      .single();

    if (rewardsError || !rewardsData) {
      console.error("❌ User rewards not found:", rewardsError);
      return NextResponse.json(
        { success: false, error: "User rewards data not found" },
        { status: 404 }
      );
    }

    console.log("✅ User balance retrieved successfully");
    console.log(`   Current Balance: ${rewardsData.current_points_balance} points`);
    console.log(`   Redeemable JMD: $${rewardsData.redeemable_jmd}`);

    return NextResponse.json(
      {
        success: true,
        user_rewards: {
          user_id: rewardsData.user_id,
          email: rewardsData.email,
          full_name: rewardsData.full_name,
          current_points_balance: rewardsData.current_points_balance,
          lifetime_points_earned: rewardsData.lifetime_points_earned,
          total_points_redeemed: rewardsData.total_points_redeemed,
          pending_redemption_points: rewardsData.pending_redemption_points,
          redeemable_jmd: rewardsData.redeemable_jmd,
        },
        latest_activity: {
          transaction_type: rewardsData.latest_transaction_type,
          points_amount: rewardsData.latest_points_amount,
          description: rewardsData.latest_transaction_description,
          date: rewardsData.latest_transaction_date,
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