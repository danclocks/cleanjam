import { NextRequest, NextResponse } from 'next/server';

// Type definitions based on your reward table schema
interface Reward {
  rewardID: number;
  userID: number;
  points: number;
  rewardType: string;
  description: string;
  status: string;
  awardedAt: string;
  redeemedAt: string | null;
}

interface GetRewardsResponse {
  success: boolean;
  data?: Reward[];
  error?: string;
}

interface CreateRewardRequest {
  userID: number;
  points: number;
  rewardType: string;
  description?: string;
}

// GET: Fetch all rewards or rewards for a specific user
export async function GET(
  request: NextRequest
): Promise<NextResponse<GetRewardsResponse>> {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const userID = searchParams.get('userID');
    const status = searchParams.get('status');

    // TODO: Replace with your actual database call
    // Example: const rewards = await db.reward.findMany({ where: { userID, status } });

    const mockRewards: Reward[] = [
      {
        rewardID: 1,
        userID: parseInt(userID || '1'),
        points: 500,
        rewardType: 'DISCOUNT',
        description: '10% off next purchase',
        status: 'ACTIVE',
        awardedAt: new Date().toISOString(),
        redeemedAt: null,
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: mockRewards,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/rewards error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rewards',
      },
      { status: 500 }
    );
  }
}

// POST: Create a new reward
export async function POST(
  request: NextRequest
): Promise<NextResponse<GetRewardsResponse>> {
  try {
    const body: CreateRewardRequest = await request.json();

    // Validate required fields
    if (!body.userID || !body.points || !body.rewardType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userID, points, rewardType',
        },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database call
    // Example: const reward = await db.reward.create({ data: body });

    const newReward: Reward = {
      rewardID: Math.floor(Math.random() * 10000),
      userID: body.userID,
      points: body.points,
      rewardType: body.rewardType,
      description: body.description || '',
      status: 'ACTIVE',
      awardedAt: new Date().toISOString(),
      redeemedAt: null,
    };

    return NextResponse.json(
      {
        success: true,
        data: [newReward],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/rewards error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create reward',
      },
      { status: 500 }
    );
  }
}

// PUT: Update a reward
export async function PUT(
  request: NextRequest
): Promise<NextResponse<GetRewardsResponse>> {
  try {
    const body = await request.json();
    const { rewardID, ...updateData } = body;

    if (!rewardID) {
      return NextResponse.json(
        {
          success: false,
          error: 'rewardID is required',
        },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database call
    // Example: const reward = await db.reward.update({ where: { rewardID }, data: updateData });

    const updatedReward: Reward = {
      rewardID,
      userID: updateData.userID || 1,
      points: updateData.points || 0,
      rewardType: updateData.rewardType || 'DISCOUNT',
      description: updateData.description || '',
      status: updateData.status || 'ACTIVE',
      awardedAt: new Date().toISOString(),
      redeemedAt: updateData.redeemedAt || null,
    };

    return NextResponse.json(
      {
        success: true,
        data: [updatedReward],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/rewards error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update reward',
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a reward
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rewardID = searchParams.get('rewardID');

    if (!rewardID) {
      return NextResponse.json(
        {
          success: false,
          error: 'rewardID query parameter is required',
        },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database call
    // Example: await db.reward.delete({ where: { rewardID: parseInt(rewardID) } });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/rewards error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete reward',
      },
      { status: 500 }
    );
  }
}