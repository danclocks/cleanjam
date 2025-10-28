// filepath: app/api/recycling/rewards/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🏆 [GET /api/recycling/rewards] Fetching all rewards');

    // Fetch all rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('reward')
      .select(`
        id,
        rewardID,
        userID,
        points,
        rewardType,
        description,
        status,
        awardedAt,
        redeemed_at
      `)
      .order('awardedAt', { ascending: false });

    if (rewardsError) {
      console.error('❌ Error fetching rewards:', rewardsError);
      return NextResponse.json(
        { error: 'Failed to fetch rewards', details: rewardsError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${rewards?.length || 0} rewards`);

    // Format the data
    const formattedRewards = rewards?.map((r: any) => ({
      ...r,
      redeemedAt: r.redeemed_at,
    })) || [];

    console.log('✅ Returning rewards');
    return NextResponse.json(formattedRewards, { status: 200 });
  } catch (error) {
    console.error('❌ [GET /api/recycling/rewards] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏆 [POST /api/recycling/rewards] Creating new reward');

    const { userID, points, rewardType, description } = await request.json();

    // Validate input
    if (!userID || !points || !rewardType) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: userID, points, rewardType' },
        { status: 400 }
      );
    }

    // Insert reward
    const { data: newReward, error: insertError } = await supabase
      .from('reward')
      .insert([{
        userID,
        points,
        rewardType,
        description: description || '',
        status: 'available',
        awardedAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating reward:', insertError);
      return NextResponse.json(
        { error: 'Failed to create reward', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Reward created:', newReward);
    return NextResponse.json(newReward, { status: 201 });
  } catch (error) {
    console.error('❌ [POST /api/recycling/rewards] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}