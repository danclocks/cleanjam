/**
 * COPY THIS FILE TO: app/api/schedule/communities/route.ts
 * 
 * This is the COMMUNITIES LIST ROUTE
 * Handles: GET list of all communities with active schedules
 * 
 * ✅ DATABASE FIELDS CORRECTED:
 * - Changed: id → scheduleID
 * - Changed: status → inactive (0 = Active, 1 = Inactive)
 * - Removed: truckRoute (NOT in database)
 * - Only returns communities with ACTIVE schedules (inactive = 0)
 */

import { NextRequest, NextResponse } from "next/server";

// Mock database - using CORRECT column names
const schedules: any[] = [
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
  {
    scheduleID: 5,
    community: "Half Way Tree",
    pickupDay: "Wednesday",
    pickupTime: "08:00",
    frequency: "Bi-weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
  {
    scheduleID: 6,
    community: "Half Way Tree",
    pickupDay: "Saturday",
    pickupTime: "08:00",
    frequency: "Bi-weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
  {
    scheduleID: 7,
    community: "Spanish Town",
    pickupDay: "Monday",
    pickupTime: "05:30",
    frequency: "Weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
  {
    scheduleID: 8,
    community: "Spanish Town",
    pickupDay: "Thursday",
    pickupTime: "05:30",
    frequency: "Weekly",
    inactive: 0,
    createdAt: new Date().toISOString(),
  },
];

// GET - Fetch list of all communities
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/schedule/communities - Fetching communities list");
    
    // Get unique communities with ACTIVE schedules (inactive = 0)
    const communities = Array.from(
      new Set(
        schedules
          .filter((s) => s.inactive === 0)
          .map((s) => s.community)
      )
    ).sort();

    return NextResponse.json(
      {
        message: "Communities fetched successfully",
        communities: communities,
        count: communities.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/schedule/communities error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}