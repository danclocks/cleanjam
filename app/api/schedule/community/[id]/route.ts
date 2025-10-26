/**
 * COPY THIS FILE TO: app/api/schedule/community/[id]/route.ts
 * 
 * This is the COMMUNITY FILTER ROUTE
 * Handles: GET schedules for specific community (resident view)
 * 
 * ✅ DATABASE FIELDS CORRECTED:
 * - Changed: id → scheduleID
 * - Changed: status → inactive (0 = Active, 1 = Inactive)
 * - Removed: truckRoute (NOT in database)
 * - Only returns ACTIVE schedules (inactive = 0)
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
];

// GET - Fetch schedules for specific community
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const community = decodeURIComponent(params.id);
    console.log("GET /api/schedule/community/[id] - Fetching for community:", community);

    // Fetch schedules for this community (only ACTIVE ones: inactive = 0)
    const communitySchedules = schedules
      .filter((s) => s.community === community && s.inactive === 0)
      .sort((a, b) => {
        const dayOrder: { [key: string]: number } = {
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
          Sunday: 7,
        };
        return (dayOrder[a.pickupDay] || 0) - (dayOrder[b.pickupDay] || 0);
      });

    return NextResponse.json(
      {
        message: `Schedules for ${community} fetched successfully`,
        schedules: communitySchedules,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/schedule/community/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}