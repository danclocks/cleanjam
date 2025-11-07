/**
 * ================================================================
 * FILE: app/api/rewards/award-signup-bonus/route.ts
 * 
 * AWARD 50-POINT SIGNUP BONUS ON FIRST LOGIN
 * 
 * POST /api/rewards/award-signup-bonus
 * 
 * Request body: { auth_id: string }
 * Response: { success, points_awarded, transaction_id, new_balance }
 * ================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth_id } = body;

    if (!auth_id) {
      return NextResponse.json(
        { success: false, error: "Missing auth_id parameter" },
        { status: 400 }
      );
    }

    console.log("🎯 Award Signup Bonus - Starting...");
    console.log(`   Auth ID: ${auth_id}`);

    // Find user by auth_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id, email, first_login_at")
      .eq("auth_id", auth_id)
      .single();

    if (userError || !userData) {
      console.error("❌ User lookup failed:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { user_id, email, first_login_at } = userData;
    console.log(`✅ User found: ${email} (ID: ${user_id})`);

    // Check if already received bonus
    if (first_login_at !== null) {
      console.log("ℹ️  Bonus already awarded on previous login");
      return NextResponse.json(
        {
          success: true,
          message: "Signup bonus already awarded",
          points_awarded: 0,
          transaction_id: null,
          already_claimed: true,
        },
        { status: 200 }
      );
    }

    // Initialize user_rewards
    await supabase.rpc("fn_init_user_rewards", { p_user_id: user_id });

    // Create signup bonus transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from("rewards_points_transactions")
      .insert({
        user_id: user_id,
        points_amount: 50,
        transaction_type: "signup_bonus",
        description: "Welcome bonus for new user sign-up",
        status: "completed",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError || !transactionData) {
      console.error("❌ Transaction insertion failed:", transactionError);
      return NextResponse.json(
        { success: false, error: "Failed to award bonus" },
        { status: 500 }
      );
    }

    // Update first_login_at
    await supabase
      .from("users")
      .update({ first_login_at: new Date().toISOString() })
      .eq("user_id", user_id);

    // Get updated balance
    const { data: rewardsData } = await supabase
      .from("user_rewards")
      .select("current_points_balance")
      .eq("user_id", user_id)
      .single();

    console.log("✅ Signup bonus awarded successfully!");
    console.log(`   New balance: ${rewardsData?.current_points_balance || 50} points`);

    return NextResponse.json(
      {
        success: true,
        message: "Signup bonus of 50 points awarded!",
        points_awarded: 50,
        transaction_id: transactionData.transaction_id,
        new_balance: rewardsData?.current_points_balance || 50,
        already_claimed: false,
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