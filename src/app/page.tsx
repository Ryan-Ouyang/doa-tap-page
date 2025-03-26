import { redirect } from 'next/navigation';

// Define a type for Next.js redirect errors
type NextRedirectError = Error & {
  digest?: string;
};

// This is a Server Component that runs only on the server
export default async function Home() {
  // Server-side data fetching - this code only runs on the server
  // and never on the client browser
  try {
    // Using relative URL since we're on the server
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reward-status`, {
      // Ensure we're getting fresh data
      cache: 'no-store',
      // Set a reasonable timeout
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const { rewardActive, rewardClaimed } = await response.json();
    
    // Server-side redirect based on the reward status
    // This happens before any content is sent to the client
    if (!rewardActive && !rewardClaimed) {
      // "Rewards not active"
      return redirect('/reward-not-active');
    } else if (rewardActive && !rewardClaimed) {
      // "Reward active, unclaimed"
      return redirect('/reward-active-unclaimed');
    } else if (rewardActive && rewardClaimed) {
      // "Reward claimed, reward still active"
      return redirect('/reward-claimed-active');
    } else {
      // "Reward claimed, reward not active"
      return redirect('/reward-claimed-inactive');
    }
  } catch (error) {
    // Cast the error to our custom type
    const nextError = error as NextRedirectError;
    
    // Only log real errors, not redirect "errors"
    if (!nextError.digest?.startsWith('NEXT_REDIRECT')) {
      console.error('Error fetching reward status:', nextError);
    }
    
    // If it's not a redirect error, show an error UI
    if (!nextError.digest?.startsWith('NEXT_REDIRECT')) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-lg text-center">
            Unable to fetch reward status. Please try again later.
          </p>
        </div>
      );
    }
    
    // If it is a redirect error, just let Next.js handle it
    throw error;
  }
}
