// Filepath: app/api/schedule/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Type definitions based on schedule table schema
interface Schedule {
  scheduleID: number;
  communityName: string;
  pickupDay: string;
  pickupTime: string;
  frequency: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

interface ScheduleParams {
  params: {
    id: string;
  };
}

interface ApiResponse {
  success: boolean;
  data?: Schedule | Schedule[];
  error?: string;
}

// GET: Fetch a specific schedule by ID
export async function GET(
  request: NextRequest,
  { params }: ScheduleParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const scheduleID = params.id;

    if (!scheduleID || isNaN(Number(scheduleID))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid schedule ID',
        },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database call
    // Example: const schedule = await db.schedule.findUnique({ where: { scheduleID: parseInt(scheduleID) } });

    const mockSchedule: Schedule = {
      scheduleID: parseInt(scheduleID),
      communityName: 'Sample Community',
      pickupDay: 'Monday',
      pickupTime: '09:00 AM',
      frequency: 'WEEKLY',
      isActive: true,
      notes: 'Regular pickup schedule',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: mockSchedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`GET /api/schedule/[id] error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch schedule',
      },
      { status: 500 }
    );
  }
}

// PUT: Update a specific schedule by ID
export async function PUT(
  request: NextRequest,
  { params }: ScheduleParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const scheduleID = params.id;

    if (!scheduleID || isNaN(Number(scheduleID))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid schedule ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate at least one field to update
    if (
      !body.communityName &&
      !body.pickupDay &&
      !body.pickupTime &&
      !body.frequency &&
      body.isActive === undefined &&
      !body.notes
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields provided for update',
        },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database call
    // Example: const schedule = await db.schedule.update({
    //   where: { scheduleID: parseInt(scheduleID) },
    //   data: body
    // });

    const updatedSchedule: Schedule = {
      scheduleID: parseInt(scheduleID),
      communityName: body.communityName || 'Sample Community',
      pickupDay: body.pickupDay || 'Monday',
      pickupTime: body.pickupTime || '09:00 AM',
      frequency: body.frequency || 'WEEKLY',
      isActive: body.isActive !== undefined ? body.isActive : true,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: updatedSchedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`PUT /api/schedule/[id] error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update schedule',
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific schedule by ID
export async function DELETE(
  request: NextRequest,
  { params }: ScheduleParams
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const scheduleID = params.id;

    if (!scheduleID || isNaN(Number(scheduleID))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid schedule ID',
        },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database call
    // Example: await db.schedule.delete({ where: { scheduleID: parseInt(scheduleID) } });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/schedule/[id] error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete schedule',
      },
      { status: 500 }
    );
  }
}