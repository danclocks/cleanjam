/**
 * ================================================================
 * FILE PATH: app/api/rewards/request-redemption/route.ts
 * CREATED: November 6, 2025
 * 
 * REQUEST POINT REDEMPTION
 * 
 * POST /api/rewards/request-redemption
 * User requests to redeem points for JMD cash.
 * Creates pending redemption transaction awaiting admin approval.
 * 
 * Request body:
 * {
 *   auth_id: string (user's Supabase auth ID),
 *   points_amount: number (must be multiple of 500),
 *   bank_account?: string (optional for now)
 * }
 * 
 * Response: { success, redemption_id, points_amount, jmd_amount, status }
 * 
 * Point conversion: 500 points = 500 JMD
 * ================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Constants
const POINTS_PER_JMD = 1;
const MIN_REDEMPTION = 500; // Minimum 500 points
const MAX_MONTHLY_REDEMPTION = 5000; // Maximum 5000 points per month

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth_id, points_amount, bank_account } = body;

    // Validate inputs
    if (!auth_id || !points_amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: auth_id, points_amount" },
        { status: 400 }
      );
    }

    if (typeof points_amount !== "number" || points_amount < MIN_REDEMPTION) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum redemption is ${MIN_REDEMPTION} points (${MIN_REDEMPTION / POINTS_PER_JMD} JMD)`,
        },
        { status: 400 }
      );
    }

    if (points_amount % POINTS_PER_JMD !== 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Points must be in multiples of ${POINTS_PER_JMD}`,
        },
        { status: 400 }
      );
    }

    console.log("💳 Request Redemption - Starting...");
    console.log(`   Auth ID: ${auth_id}`);
    console.log(`   Points: ${points_amount}`);

    // Step 1: Find user by auth_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id, email, full_name")
      .eq("auth_id", auth_id)
      .single();

    if (userError || !userData) {
      console.error("❌ User not found:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user_id = userData.user_id;
    console.log(`✅ User found: ${userData.email}`);

    // Step 2: Get current balance
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("user_rewards")
      .select("current_points_balance")
      .eq("user_id", user_id)
      .single();

    if (rewardsError || !rewardsData) {
      console.error("❌ Rewards not found:", rewardsError);
      return NextResponse.json(
        { success: false, error: "User rewards not found" },
        { status: 404 }
      );
    }

    const currentBalance = rewardsData.current_points_balance || 0;
    console.log(`   Current balance: ${currentBalance} points`);

    // Step 3: Check if user has enough points
    if (currentBalance < points_amount) {
      console.warn(`⚠️  Insufficient balance: ${currentBalance} < ${points_amount}`);
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient points. You have ${currentBalance} points but requested ${points_amount}.`,
          current_balance: currentBalance,
        },
        { status: 400 }
      );
    }

    // Step 4: Check monthly limit (optional - can remove if not needed)
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const { data: monthlyRedemptions } = await supabase
      .from("rewards_points_transactions")
      .select("points_amount")
      .eq("user_id", user_id)
      .eq("transaction_type", "redemption_approved")
      .eq("status", "completed")
      .gte("created_at", thisMonthStart.toISOString());

    const monthlyTotal = (monthlyRedemptions || []).reduce(
      (sum, tx) => sum + Math.abs(tx.points_amount),
      0
    );

    if (monthlyTotal + points_amount > MAX_MONTHLY_REDEMPTION) {
      console.warn(
        `⚠️  Monthly limit exceeded: ${monthlyTotal} + ${points_amount} > ${MAX_MONTHLY_REDEMPTION}`
      );
      return NextResponse.json(
        {
          success: false,
          error: `Monthly redemption limit exceeded. You've redeemed ${monthlyTotal} points this month. Limit is ${MAX_MONTHLY_REDEMPTION}.`,
          monthly_redeemed: monthlyTotal,
          monthly_limit: MAX_MONTHLY_REDEMPTION,
        },
        { status: 400 }
      );
    }

    console.log(`✅ Balance check passed`);

    // Step 5: Create pending transaction (negative points = deduction)
    const { data: transactionData, error: transactionError } = await supabase
      .from("rewards_points_transactions")
      .insert({
        user_id: user_id,
        points_amount: -points_amount, // Negative because it's being redeemed
        transaction_type: "redemption_approved",
        description: `Redemption request for ${points_amount} points (${points_amount / POINTS_PER_JMD} JMD)`,
        status: "pending", // Admin must approve
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError || !transactionData) {
      console.error("❌ Transaction creation failed:", transactionError);
      return NextResponse.json(
        { success: false, error: "Failed to create redemption request" },
        { status: 500 }
      );
    }

    console.log(`✅ Redemption request created: ${transactionData.transaction_id}`);

    const jmdAmount = points_amount / POINTS_PER_JMD;

    return NextResponse.json(
      {
        success: true,
        message: `Redemption request submitted! Awaiting admin approval.`,
        transaction_id: transactionData.transaction_id,
        points_amount: points_amount,
        jmd_amount: jmdAmount,
        status: "pending",
        remaining_balance: currentBalance - points_amount,
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
 * INTEGRATION: How to call from rewards dashboard
 * ================================================================
 * 
 * When user clicks "Redeem Now" button:
 * 
 * const response = await fetch("/api/rewards/request-redemption", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({
 *     auth_id: userAuthId,
 *     points_amount: 500, // or whatever amount user selected
 *     bank_account: bankAccountNumber // optional
 *   }),
 * });
 * 
 * const data = await response.json();
 * if (data.success) {
 *   alert("Redemption request submitted! Awaiting approval.");
 * } else {
 *   alert(data.error);
 * }
 * 
 * POINT CONVERSION:
 * 500 points = 500 JMD
 * 1000 points = 1000 JMD
 * etc.
 * 
 * LIMITS:
 * - Minimum: 500 points
 * - Maximum per month: 5000 points
 */