export default function RewardClaimedInactivePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">
        Reward Claimed - Program Ended
      </h1>
      <p className="text-lg text-center">
        You've successfully claimed your reward! The reward program has now
        ended.
      </p>
      <div className="mt-6 p-6 bg-blue-100 rounded-lg border border-blue-200">
        <p className="text-blue-800 font-medium">
          Thank you for participating in our reward program!
        </p>
        <p className="text-blue-700 mt-2">
          Check back later for future opportunities.
        </p>
      </div>
    </div>
  )
}
