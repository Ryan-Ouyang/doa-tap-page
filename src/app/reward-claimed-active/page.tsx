export default function RewardClaimedActivePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Reward Claimed - Still Active</h1>
      <p className="text-lg text-center">
        You've successfully claimed your reward! The reward program is still
        active.
      </p>
      <div className="mt-6 p-6 bg-green-100 rounded-lg border border-green-200">
        <p className="text-green-800 font-medium">
          Your reward has been processed and sent to your account.
        </p>
      </div>
    </div>
  )
}
