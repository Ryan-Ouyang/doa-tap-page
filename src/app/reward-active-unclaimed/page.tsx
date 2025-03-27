'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function RewardActiveUnclaimedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Get the iykRef from the URL query parameters
  const iykRef = searchParams.get('iykRef');

  const handleClaimReward = async () => {
    if (!iykRef) {
      setError('Missing reference ID. Please tap your hat again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claim-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iykRef }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to claim reward');
      }

      setSuccess(true);
      
      // Redirect to the claimed page after a short delay
      setTimeout(() => {
        router.push(`/reward-claimed-active?iykRef=${iykRef}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-green-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-green-600">Success!</h1>
          <p className="text-lg mb-6">
            Your reward has been claimed successfully!
          </p>
          <p className="text-gray-600">
            Redirecting you to your reward details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">Reward Available!</h1>
        <p className="text-lg mb-6">
          You have an active reward waiting to be claimed!
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleClaimReward}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-colors w-full
            ${isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Processing...' : 'Claim Your Reward'}
        </button>
      </div>
    </div>
  );
}
