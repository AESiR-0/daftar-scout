export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        <div className="h-8 w-48 bg-gray-700 animate-pulse rounded mx-auto" />
        <div className="h-6 w-64 bg-gray-700 animate-pulse rounded mx-auto" />
        
        <div className="bg-card p-8 rounded-lg border shadow-sm">
          <div className="h-10 w-full bg-gray-700 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
} 