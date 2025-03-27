'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RewardActiveUnclaimedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleClaimReward = async () => {
    // Validate wallet address (basic validation for now)
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setError('Please enter a valid Ethereum wallet address (0x followed by 40 hexadecimal characters)');
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
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to claim reward. Please try again.');
        setIsLoading(false);
        return;
      }

      // Reward claimed successfully
      setSuccess(true);
      setIsLoading(false);

      // Redirect to the claimed page after a short delay
      setTimeout(() => {
        router.push('/reward-claimed-active');
      }, 2000);
    } catch (error) {
      console.error('Error claiming reward:', error);
      setError('An unexpected error occurred. Please try again.');
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
        <h1 className="text-3xl font-bold mb-4 text-blue-600">Claim Your Reward</h1>
        <p className="text-lg mb-6">
          Congratulations! You have tapped your Department of Agriculture hat during an active reward period.
          Enter your Ethereum wallet address below to claim your reward.
        </p>

        <div className="mb-6">
          <label htmlFor="wallet-address" className="block text-left text-sm font-medium text-gray-700 mb-2">
            Ethereum Wallet Address
          </label>
          <input
            id="wallet-address"
            type="text"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1 text-left">
            This address will receive your reward when the current reward period ends.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-left">
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
          {isLoading ? 'Claiming...' : 'Claim Reward'}
        </button>
      </div>
    </div>
  );
}
