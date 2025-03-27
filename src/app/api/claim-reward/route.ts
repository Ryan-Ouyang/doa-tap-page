import { NextRequest, NextResponse } from 'next/server';
import { validateIykRef } from '@/lib/iyk-api';
import { getOrCreateChip, getActiveRewardPeriod, hasChipClaimedReward, createClaim } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { iykRef } = await request.json();

    // Validate the input
    if (!iykRef) {
      return NextResponse.json(
        { message: 'Missing iykRef parameter' },
        { status: 400 }
      );
    }

    // Step 1: Validate the tap with the IYK API
    const { isValidRef, uid } = await validateIykRef(iykRef);

    // If the tap is invalid, return an error
    if (!isValidRef || !uid) {
      return NextResponse.json(
        { message: 'Invalid tap reference' },
        { status: 400 }
      );
    }

    // Step 2: Get or create the chip record
    const chip = await getOrCreateChip(uid);
    if (!chip) {
      return NextResponse.json(
        { message: 'Failed to get or create chip record' },
        { status: 500 }
      );
    }

    // Step 3: Check if there's an active reward period
    const activeRewardPeriod = await getActiveRewardPeriod();
    
    // If no active reward period, return an error
    if (!activeRewardPeriod) {
      return NextResponse.json(
        { message: 'No active reward period' },
        { status: 400 }
      );
    }

    // Step 4: Check if the chip has already claimed a reward in this period
    const hasClaimed = await hasChipClaimedReward(chip.id, activeRewardPeriod.id);

    // If already claimed, return an error
    if (hasClaimed) {
      return NextResponse.json(
        { message: 'Reward already claimed' },
        { status: 400 }
      );
    }

    // Step 5: Create a claim record
    const claim = await createClaim(chip.id, activeRewardPeriod.id);
    
    if (!claim) {
      return NextResponse.json(
        { message: 'Failed to create claim record' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Reward claimed successfully',
        claimId: claim.id,
        claimedAt: claim.claimed_at
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error claiming reward:', error);
    
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
