/**
 * COPY THIS FILE TO: app/api/schedule/route.ts
 * 
 * This is the MAIN SCHEDULE API ROUTE
 * Handles: GET all schedules, POST create new schedule
 * 
 * ✅ DATABASE FIELDS CORRECTED:
 * - Changed: id → scheduleID
 * - Changed: status → inactive (0 = Active, 1 = Inactive)
 * - Removed: truckRoute (NOT in database)
 */

import { NextRequest, NextResponse } from "next/server";

// Mock database - Replace with real database in production
// Using CORRECT column names from database
let schedules: any[] = [
  {
    scheduleID: 1,
    community: "Downtown Kingston",
    pickupDay: "Monday",
    pickupTime: "06:00",
    frequency: "Weekly",
    inactive: 0,  // 0 = Active, 1 = Inactive
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

let nextId = 5;

// GET - Fetch all schedules
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/schedule - Fetching all schedules");
    
    return NextResponse.json(
      {
        message: "Schedules fetched successfully",
        schedules: schedules.sort((a, b) => a.scheduleID - b.scheduleID),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/schedule error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("POST /api/schedule - Creating schedule:", body);

    // Validation
    const { community, pickupDay, pickupTime, frequency, inactive } = body;

    if (!community || !pickupDay || !pickupTime) {
      return NextResponse.json(
        { message: "Community, pickup day, and time are required" },
        { status: 400 }
      );
    }

    // Validate day (pickupDay should match database VARCHAR(20))
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!validDays.includes(pickupDay)) {
      return NextResponse.json(
        { message: "Invalid pickup day" },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM for TIME type)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(pickupTime)) {
      return NextResponse.json(
        { message: "Invalid time format (use HH:MM)" },
        { status: 400 }
      );
    }

    // Validate frequency (should match ENUM values from database)
    const validFrequencies = ["Weekly", "Bi-weekly", "Monthly", "Twice a week"];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { message: "Invalid frequency" },
        { status: 400 }
      );
    }

    const newSchedule = {
      scheduleID: nextId++,
      community,
      pickupDay,
      pickupTime,
      frequency: frequency || "Weekly",
      inactive: inactive !== undefined ? inactive : 0,  // Default 0 (Active)
      createdAt: new Date().toISOString(),
    };

    schedules.push(newSchedule);

    return NextResponse.json(
      {
        message: "Schedule created successfully",
        schedule: newSchedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/schedule error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}