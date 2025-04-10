export default function TapUnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          Unauthorized Tap
        </h1>
        <p className="text-lg mb-6">
          The hat you tapped is not registered in our system. Please contact the
          Department of Agriculture for assistance.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 inline-block"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
