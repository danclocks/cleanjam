/**
 * ===================================
 * FILE PATH: app/api/user/profile/route.ts
 * ===================================
 * 
 * GET endpoint to fetch logged-in user's profile from database
 * Used by the new report page to display user information
 * 
 * ✨ FIXED: Now includes role field in the select
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from request headers or query params
    const searchParams = request.nextUrl.searchParams;
    const authId = searchParams.get("authId");

    if (!authId) {
      return NextResponse.json(
        { error: "Missing authId parameter" },
        { status: 400 }
      );
    }

    // Fetch user profile from Supabase
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("user_id, full_name, email, username, avatar_url, role")
      .eq("auth_id", authId)
      .single();

    if (profileError || !profileData) {
      console.error("Failed to load user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to load your profile" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile: profileData }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    return NextResponse.json(
      { error: "An error occurred loading your profile" },
      { status: 500 }
    );
  }
}