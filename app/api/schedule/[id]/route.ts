/**
 * COPY THIS FILE TO: app/api/schedule/[id]/route.ts
 * 
 * This is the INDIVIDUAL SCHEDULE OPERATIONS ROUTE
 * Handles: GET single schedule, PUT update schedule, DELETE schedule
 * 
 * ✅ DATABASE FIELDS CORRECTED:
 * - Changed: id → scheduleID
 * - Changed: status → inactive (0 = Active, 1 = Inactive)
 * - Removed: truckRoute (NOT in database)
 */

import { NextRequest, NextResponse } from "next/server";

// Mock database - same as main route, using CORRECT column names
let schedules: any[] = [
  {
    scheduleID: 1,
    community: "Downtown Kingston",
    pickupDay: "Monday",
    pickupTime: "06:00",
    frequency: "Weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
  {
    scheduleID: 2,
    community: "Downtown Kingston",
    pickupDay: "Thursday",
    pickupTime: "06:00",
    frequency: "Weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
  {
    scheduleID: 3,
    community: "Uptown Kingston",
    pickupDay: "Tuesday",
    pickupTime: "07:00",
    frequency: "Weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
  {
    scheduleID: 4,
    community: "Uptown Kingston",
    pickupDay: "Friday",
    pickupTime: "07:00",
    frequency: "Weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
];

// GET - Fetch single schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleID = parseInt(params.id);
    console.log("GET /api/schedule/[id] - Fetching schedule:", scheduleID);
    
    const schedule = schedules.find((s) => s.scheduleID === scheduleID);

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Schedule fetched successfully",
        schedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/schedule/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleID = parseInt(params.id);
    const body = await request.json();
    console.log("PUT /api/schedule/[id] - Updating schedule:", scheduleID, body);

    const schedule = schedules.find((s) => s.scheduleID === scheduleID);
    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 }
      );
    }

    // Validate day if provided
    if (body.pickupDay) {
      const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      if (!validDays.includes(body.pickupDay)) {
        return NextResponse.json(
          { message: "Invalid pickup day" },
          { status: 400 }
        );
      }
    }

    // Validate time format if provided
    if (body.pickupTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(body.pickupTime)) {
        return NextResponse.json(
          { message: "Invalid time format (use HH:MM)" },
          { status: 400 }
        );
      }
    }

    // Validate frequency if provided
    if (body.frequency) {
      const validFrequencies = ["Weekly", "Bi-weekly", "Monthly", "Twice a week"];
      if (!validFrequencies.includes(body.frequency)) {
        return NextResponse.json(
          { message: "Invalid frequency" },
          { status: 400 }
        );
      }
    }

    // Validate inactive value if provided (should be 0 or 1)
    if (body.inactive !== undefined) {
      if (body.inactive !== 0 && body.inactive !== 1) {
        return NextResponse.json(
          { message: "Invalid inactive value (use 0 or 1)" },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (body.community) schedule.community = body.community;
    if (body.pickupDay) schedule.pickupDay = body.pickupDay;
    if (body.pickupTime) schedule.pickupTime = body.pickupTime;
    if (body.frequency) schedule.frequency = body.frequency;
    if (body.inactive !== undefined) schedule.inactive = body.inactive;

    return NextResponse.json(
      {
        message: "Schedule updated successfully",
        schedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/schedule/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleID = parseInt(params.id);
    console.log("DELETE /api/schedule/[id] - Deleting schedule:", scheduleID);
    
    const index = schedules.findIndex((s) => s.scheduleID === scheduleID);

    if (index === -1) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 }
      );
    }

    const deletedSchedule = schedules.splice(index, 1);

    return NextResponse.json(
      {
        message: "Schedule deleted successfully",
        schedule: deletedSchedule[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/schedule/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}