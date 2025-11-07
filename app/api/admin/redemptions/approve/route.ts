/**
 * ================================================================
 * FILE PATH: app/api/admin/redemptions/approve/route.ts
 * CREATED: November 6, 2025
 * 
 * APPROVE/REJECT REDEMPTION REQUESTS (ADMIN ONLY)
 * 
 * PUT /api/admin/redemptions/approve
 * Admin approves or rejects pending redemption requests.
 * 
 * Request body:
 * {
 *   admin_auth_id: string (admin's Supabase auth ID),
 *   transaction_id: number (the pending redemption transaction),
 *   action: 'approve' | 'reject',
 *   notes?: string (optional admin notes)
 * }
 * 
 * Response: { success, message, points_amount, status }
 * 
 * When approved: Points are deducted from user, marked as completed
 * When rejected: Transaction is cancelled, points returned to user
 * ================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_auth_id, transaction_id, action, notes } = body;

    // Validate inputs
    if (!admin_auth_id || !transaction_id || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: admin_auth_id, transaction_id, action",
        },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    console.log("👤 Redemption Approval - Starting...");
    console.log(`   Action: ${action}`);
    console.log(`   Transaction ID: ${transaction_id}`);

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
        { success: false, error: "Only admins can approve redemptions" },
        { status: 403 }
      );
    }

    console.log(`✅ Admin verified: ${adminData.email} (${adminData.role})`);

    // Step 2: Get the pending transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from("rewards_points_transactions")
      .select("transaction_id, user_id, points_amount, status, description")
      .eq("transaction_id", transaction_id)
      .eq("transaction_type", "redemption_approved")
      .single();

    if (transactionError || !transactionData) {
      console.error("❌ Transaction not found:", transactionError);
      return NextResponse.json(
        { success: false, error: "Redemption request not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Transaction found: ${transactionData.transaction_id}`);

    if (transactionData.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Transaction is ${transactionData.status}, not pending`,
        },
        { status: 400 }
      );
    }

    const user_id = transactionData.user_id;
    const pointsAmount = transactionData.points_amount; // Negative number

    // Step 3: Handle approval or rejection
    let newStatus: "completed" | "failed";
    let resultMessage: string;

    if (action === "approve") {
      newStatus = "completed";
      resultMessage = `Redemption approved! ${Math.abs(pointsAmount)} points deducted.`;
      console.log(`✅ Approving redemption for ${Math.abs(pointsAmount)} points`);
    } else {
      // Reject: reverse the transaction
      newStatus = "failed";
      resultMessage = `Redemption rejected. ${Math.abs(pointsAmount)} points returned to user.`;
      console.log(`❌ Rejecting redemption. Returning ${Math.abs(pointsAmount)} points`);
    }

    // Step 4: Update transaction status
    const { error: updateError } = await supabase
      .from("rewards_points_transactions")
      .update({
        status: newStatus,
        processed_by: adminData.user_id,
      })
      .eq("transaction_id", transaction_id);

    if (updateError) {
      console.error("❌ Transaction update failed:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to process approval" },
        { status: 500 }
      );
    }

    console.log(`✅ Transaction status updated to: ${newStatus}`);

    // Step 5: If rejected, create reversal transaction to return points
    if (action === "reject") {
      const { error: reversalError } = await supabase
        .from("rewards_points_transactions")
        .insert({
          user_id: user_id,
          points_amount: Math.abs(pointsAmount), // Positive = return points
          transaction_type: "redemption_rejected",
          description: `Redemption request rejected by admin. Points returned. ${notes ? `Admin notes: ${notes}` : ""}`,
          status: "completed",
          processed_by: adminData.user_id,
          created_at: new Date().toISOString(),
        });

      if (reversalError) {
        console.warn("⚠️  Could not create reversal transaction:", reversalError);
      } else {
        console.log(`✅ Reversal transaction created - points returned to user`);
      }
    }

    // Step 6: Get updated user balance
    const { data: updatedRewards } = await supabase
      .from("user_rewards")
      .select("current_points_balance, total_points_redeemed")
      .eq("user_id", user_id)
      .single();

    console.log(`✅ Redemption ${action} completed!`);
    console.log(`   User new balance: ${updatedRewards?.current_points_balance || 0} points`);

    return NextResponse.json(
      {
        success: true,
        message: resultMessage,
        transaction_id: transaction_id,
        action: action,
        status: newStatus,
        points_amount: Math.abs(pointsAmount),
        user_new_balance: updatedRewards?.current_points_balance || 0,
        admin_notes: notes || null,
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
 * INTEGRATION: How to build admin redemptions management page
 * ================================================================
 * 
 * 1. Fetch pending redemptions:
 * const response = await fetch(
 *   "/api/admin/redemptions/pending?admin_auth_id=...",
 *   { method: "GET" }
 * );
 * 
 * 2. Admin clicks "Approve" or "Reject" button
 * 
 * 3. Call this approval route:
 * const approveRes = await fetch(
 *   "/api/admin/redemptions/approve",
 *   {
 *     method: "PUT",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({
 *       admin_auth_id: adminAuthId,
 *       transaction_id: 123,
 *       action: "approve", // or "reject"
 *       notes: "Approved - credited to account" // optional
 *     }),
 *   }
 * );
 * 
 * 4. Show confirmation to admin
 * const data = await approveRes.json();
 * if (data.success) {
 *   alert(`${data.message} - User balance now: ${data.user_new_balance} points`);
 *   // Refresh pending list
 * }
 * 
 * WORKFLOW:
 * 1. User requests redemption (500-5000 points)
 * 2. Transaction created in "pending" status
 * 3. Admin sees it in approval queue
 * 4. Admin clicks approve/reject
 * 5. Points deducted (approve) or returned (reject)
 * 6. User sees updated status
 */