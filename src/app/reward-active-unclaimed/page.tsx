export default function RewardActiveUnclaimedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Reward Active - Unclaimed</h1>
      <p className="text-lg text-center mb-6">
        You have an active reward waiting to be claimed!
      </p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Claim Your Reward
      </button>
    </div>
  );
}
