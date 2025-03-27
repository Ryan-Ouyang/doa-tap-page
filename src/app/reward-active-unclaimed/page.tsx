'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import { Address, Hex } from 'viem';

export default function RewardActiveUnclaimedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Store wallet address and signature from the wallet connection
  const [walletData, setWalletData] = useState<{
    message: string;
    signature: string;
  } | null>(null);

  const handleSignatureComplete = (address: Address, message: string, signature: Hex) => {
    setWalletData({ message, signature });
  };

  const handleClaimReward = async () => {
    // Ensure we have wallet data
    if (!walletData) {
      setError('Please connect your wallet and sign the message first');
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
        body: JSON.stringify({
          message: walletData.message,
          signature: walletData.signature
        }),
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
          <WalletConnect onSignatureComplete={handleSignatureComplete} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-left">
            {error}
          </div>
        )}

        <button
          onClick={handleClaimReward}
          disabled={isLoading || !walletData}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-colors w-full
            ${isLoading || !walletData
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Claiming...' : 'Claim Reward'}
        </button>
      </div>
    </div>
  );
}
