/**
 * ================================================================
 * FILE PATH: app/api/rewards/transaction-history/route.ts
 * CREATED: November 7, 2025
 * 
 * GET USER'S REWARDS TRANSACTION HISTORY
 * 
 * GET /api/rewards/transaction-history?auth_id=UUID&limit=15&offset=0
 * 
 * Query params:
 *   - auth_id (required) - User's Supabase auth ID
 *   - limit (optional, default: 15)
 *   - offset (optional, default: 0)
 * 
 * Response: { success, transactions, totalCount, pagination }
 * 
 * Returns paginated list of user's reward transactions
 * ================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const auth_id = searchParams.get("auth_id");
    const limit = parseInt(searchParams.get("limit") || "15");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate auth_id
    if (!auth_id) {
      return NextResponse.json(
        { success: false, error: "Missing auth_id parameter" },
        { status: 400 }
      );
    }

    console.log("📜 [HISTORY] Fetching transaction history...");
    console.log(`   Auth ID: ${auth_id}`);
    console.log(`   Limit: ${limit}, Offset: ${offset}`);

    // Step 1: Find user by auth_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id, email, full_name")
      .eq("auth_id", auth_id)
      .single();

    if (userError || !userData) {
      console.error("❌ [HISTORY] User not found:", userError?.message);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user_id = userData.user_id;
    console.log(`✅ [HISTORY] User found: ${userData.email}`);

    // Step 2: Query transactions with pagination
    const { data: transactions, error: queryError, count } = await supabase
      .from("rewards_points_transactions")
      .select(
        `
        transaction_id,
        user_id,
        points_amount,
        transaction_type,
        description,
        status,
        related_report_id,
        created_at
      `,
        { count: "exact" }
      )
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (queryError) {
      console.error("❌ [HISTORY] Query failed:", queryError.message);
      return NextResponse.json(
        { success: false, error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    console.log(`✅ [HISTORY] Found ${transactions?.length || 0} transactions`);
    console.log(`   Total available: ${count || 0}`);

    // Step 3: Format transactions
    const formattedTransactions = (transactions || []).map((tx) => {
      const date = new Date(tx.created_at);
      return {
        transaction_id: tx.transaction_id,
        points: tx.points_amount,
        type: tx.transaction_type,
        status: tx.status,
        description: tx.description,
        related_report_id: tx.related_report_id,
        date: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp: tx.created_at,
      };
    });

    console.log("✅ [HISTORY] Transactions formatted successfully");

    return NextResponse.json(
      {
        success: true,
        transactions: formattedTransactions,
        totalCount: count || 0,
        pagination: {
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [HISTORY] Unexpected error:", error.message);
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
 *   "transactions": [
 *     {
 *       "transaction_id": 1,
 *       "points": 100,
 *       "type": "report_resolved",
 *       "status": "completed",
 *       "description": "Critical priority report resolved",
 *       "related_report_id": 42,
 *       "date": "Nov 7, 2025",
 *       "time": "02:30 PM",
 *       "timestamp": "2025-11-07T14:30:00.000Z"
 *     },
 *     ...
 *   ],
 *   "totalCount": 15,
 *   "pagination": {
 *     "limit": 15,
 *     "offset": 0,
 *     "hasMore": false
 *   }
 * }
 * 
 * ================================================================
 * INTEGRATION: Called from rewards dashboard
 * ================================================================
 * 
 * const response = await fetch(
 *   `/api/rewards/transaction-history?auth_id=${authId}&limit=15&offset=0`,
 *   { method: "GET" }
 * );
 * 
 * const data = await response.json();
 * setTransactions(data.transactions);
 */