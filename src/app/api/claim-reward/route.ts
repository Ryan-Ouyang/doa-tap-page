import { NextRequest, NextResponse } from 'next/server';
import { validateIykOtp } from '@/lib/iyk-api';
import { getChipByUid, getActiveRewardPeriod, hasChipClaimedReward, createClaim } from '@/lib/database';
import { OTP_COOKIE_NAME } from '@/middleware';
import { verifyWalletSignature } from '@/lib/signature-verification';

export async function POST(request: NextRequest) {
  try {
    // Get request body data
    const { signature, message } = await request.json();
    
    // Validate signature
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature. Please sign the message to verify wallet ownership.' },
        { status: 400 }
      );
    }
    
    if (!message) {
      return NextResponse.json(
        { error: 'Missing message. Please sign the message to verify wallet ownership.' },
        { status: 400 }
      );
    }
    
    // Verify the signature matches the wallet address
    const { isValid, address } = await verifyWalletSignature(signature, message);
    if (!isValid || !address) {
      return NextResponse.json(
        { error: 'Invalid signature. Please try again with the correct wallet.' },
        { status: 401 }
      );
    }
    
    // Get the OTP from the cookie
    const otpCookie = request.cookies.get(OTP_COOKIE_NAME);
    
    // If no OTP cookie exists, return an error
    if (!otpCookie?.value) {
      return NextResponse.json(
        { error: 'Authentication required. Please tap your hat again.' },
        { status: 401 }
      );
    }
    
    // Step 1: Validate the OTP with the IYK API
    const { isExpired, uid } = await validateIykOtp(otpCookie.value);
    
    // If the OTP is expired or invalid, return an error
    if (isExpired || !uid) {
      return NextResponse.json(
        { error: 'Your session has expired. Please tap your hat again.' },
        { status: 401 }
      );
    }

    // Step 2: Check if the chip is authorized (exists in the database)
    const chip = await getChipByUid(uid);
    
    // If the chip is not authorized, return an error
    if (!chip) {
      return NextResponse.json(
        { error: 'This hat is not authorized. Please contact the Department of Agriculture.' },
        { status: 403 }
      );
    }

    // Step 3: Check if there's an active reward period
    const activeRewardPeriod = await getActiveRewardPeriod();
    
    // If no active reward period, return an error
    if (!activeRewardPeriod) {
      return NextResponse.json(
        { error: 'No active reward period' },
        { status: 400 }
      );
    }

    // Step 4: Check if the chip has already claimed a reward in this period
    const hasClaimed = await hasChipClaimedReward(chip.id, activeRewardPeriod.id);

    // If already claimed, return an error
    if (hasClaimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      );
    }

    // Step 5: Create a claim record with the wallet address
    const claim = await createClaim(chip.id, activeRewardPeriod.id, address);
    
    if (!claim) {
      return NextResponse.json(
        { error: 'Failed to create claim record' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Reward claimed successfully',
        claimId: claim.id,
        claimedAt: claim.claimed_at,
        walletAddress: claim.wallet_address
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error claiming reward:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
