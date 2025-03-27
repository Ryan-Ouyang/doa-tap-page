import { redirect } from 'next/navigation';
import { validateIykRef } from '@/lib/iyk-api';
import { getOrCreateChip, getActiveRewardPeriod, hasChipClaimedReward } from '@/lib/database';

// Define a type for Next.js redirect errors
type NextRedirectError = Error & {
  digest?: string;
};

// This is a Server Component that runs only on the server
export default async function Home({ searchParams }: { searchParams: { iykRef?: string } }) {
  // Get the iykRef from the query parameters
  const { iykRef } = searchParams;

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
    const { isValidRef, uid } = await validateIykRef(iykRef);

    // If the tap is invalid, redirect to the invalid tap page
    if (!isValidRef || !uid) {
      return redirect('/tap-invalid');
    }

    // Step 2: Get or create the chip record
    const chip = await getOrCreateChip(uid);
    if (!chip) {
      throw new Error('Failed to get or create chip record');
    }

    // Step 3: Check if there's an active reward period
    const activeRewardPeriod = await getActiveRewardPeriod();
    
    // If no active reward period, redirect to the "reward not active" page
    if (!activeRewardPeriod) {
      return redirect('/reward-not-active');
    }

    // Step 4: Check if the chip has already claimed a reward in this period
    const hasClaimed = await hasChipClaimedReward(chip.id, activeRewardPeriod.id);

    // Redirect based on claim status
    if (hasClaimed) {
      // Reward claimed, reward still active
      return redirect('/reward-claimed-active');
    } else {
      // Reward active, unclaimed
      return redirect('/reward-active-unclaimed');
    }
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
