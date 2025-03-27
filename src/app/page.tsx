import { redirect } from 'next/navigation';
import { validateIykRef } from '@/lib/iyk-api';
import { getOrCreateChip, getActiveRewardPeriod, hasChipClaimedReward } from '@/lib/database';

// Define a type for Next.js redirect errors
type NextRedirectError = Error & {
  digest?: string;
};

// This is a Server Component that runs only on the server
export default async function Home({ searchParams }: { searchParams: { iykRef?: string } }) {
  // Get the iykRef from the query parameters - in Next.js 15, we need to await searchParams
  const params = await searchParams;
  const iykRef = params.iykRef;

  // If no iykRef is provided, show a message
  if (!iykRef) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Department of Agriculture</h1>
        <p className="text-lg text-center mb-6">
          Please tap your Department of Agriculture hat to access rewards.
        </p>
      </div>
    );
  }

  try {
    // Step 1: Validate the tap with the IYK API
    const { isValidRef, uid, otp } = await validateIykRef(iykRef);

    // If the tap is invalid, redirect to the invalid tap page
    if (!isValidRef || !uid) {
      return redirect('/tap-invalid');
    }

    // If we don't have an OTP, we can't authenticate the user for protected pages
    if (!otp || !otp.code) {
      throw new Error('No OTP received from IYK API');
    }

    // Step 2: Get or create the chip record
    const chip = await getOrCreateChip(uid);
    if (!chip) {
      throw new Error('Failed to get or create chip record');
    }

    // Step 3: Check if there's an active reward period
    const activeRewardPeriod = await getActiveRewardPeriod();
    
    // Determine which page to redirect to based on the reward status
    let redirectPath = '/reward-not-active';
    
    if (activeRewardPeriod) {
      // Check if the chip has already claimed a reward in this period
      const hasClaimed = await hasChipClaimedReward(chip.id, activeRewardPeriod.id);
      
      if (hasClaimed) {
        // Reward claimed, reward still active
        redirectPath = '/reward-claimed-active';
      } else {
        // Reward active, unclaimed
        redirectPath = '/reward-active-unclaimed';
      }
    }
    
    // Use the API route to set the cookie and redirect
    // This approach works better in Next.js 15 for setting cookies
    return redirect(`/api/set-cookie-redirect?otp=${otp.code}&redirectTo=${redirectPath}`);
    
  } catch (error) {
    // Cast the error to our custom type
    const nextError = error as NextRedirectError;
    
    // Only log real errors, not redirect "errors"
    if (!nextError.digest?.startsWith('NEXT_REDIRECT')) {
      console.error('Error processing tap:', nextError);
    }
    
    // If it's not a redirect error, show an error UI
    if (!nextError.digest?.startsWith('NEXT_REDIRECT')) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-lg text-center">
            Unable to process your tap. Please try again later.
          </p>
        </div>
      );
    }
    
    // If it is a redirect error, just let Next.js handle it
    throw error;
  }
}
