export function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-xl p-3 animate-pulse">
      <div className="relative pb-[56.25%] mb-2 bg-gray-700 rounded-md" />
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-600 rounded-full" />
        <div className="h-3 w-1/2 bg-gray-700 rounded" />
      </div>
    </div>
  );
}
