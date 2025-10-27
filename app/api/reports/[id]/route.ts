/**
 * ===================================
 * FILE PATH: app/api/reports/[id]/route.ts
 * ===================================
 * 
 * API routes for individual report operations
 * GET: Fetch single report
 * PUT: Update report
 * DELETE: Delete report
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ==================== GET - FETCH SINGLE REPORT ====================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("report")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (error || !data) {
      console.error("❌ Fetch report error:", error);
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ==================== PUT - UPDATE REPORT ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const body = await request.json();
    const { status, priority, description, resolution_notes, resolved_at } =
      body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (description) updateData.description = description;
    if (resolution_notes) updateData.resolution_notes = resolution_notes;
    if (resolved_at) updateData.resolved_at = resolved_at;

    const { data, error } = await supabase
      .from("report")
      .update(updateData)
      .eq("report_id", reportId)
      .select()
      .single();

    if (error || !data) {
      console.error("❌ Update report error:", error);
      return NextResponse.json(
        { error: "Failed to update report" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ==================== DELETE - DELETE REPORT ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // First, get the report to delete photos
    const { data: reportData, error: fetchError } = await supabase
      .from("report")
      .select("photos")
      .eq("report_id", reportId)
      .single();

    if (fetchError || !reportData) {
      console.error("❌ Fetch report error:", fetchError);
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Delete photos from storage
    if (reportData.photos && Array.isArray(reportData.photos)) {
      for (const photoUrl of reportData.photos) {
        try {
          // Extract file path from URL
          const filePath = photoUrl.split("/reports/")[1];
          if (filePath) {
            await supabase.storage.from("reports").remove([filePath]);
          }
        } catch (err) {
          console.warn("⚠️ Error deleting photo:", err);
        }
      }
    }

    // Delete report from database
    const { error: deleteError } = await supabase
      .from("report")
      .delete()
      .eq("report_id", reportId);

    if (deleteError) {
      console.error("❌ Delete report error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete report" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Report deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}