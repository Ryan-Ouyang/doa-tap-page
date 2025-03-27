export default function TapInvalidPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Invalid Tap</h1>
        <p className="text-lg mb-6">
          Sorry, we couldn't validate your Department of Agriculture hat. 
        </p>
        <p className="text-gray-600">
          Please make sure you're using an official Department of Agriculture hat and try again.
        </p>
      </div>
    </div>
  );
}
