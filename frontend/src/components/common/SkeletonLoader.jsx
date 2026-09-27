export default function SkeletonLoader({ count = 1, variant = 'card' }) {
  const skeletons = Array.from({ length: count });

  const variants = {
    card: (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-soft">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-lg w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded-lg w-5/6 animate-pulse" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
        </div>
      </div>
    ),
    list: (
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-soft">
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded-lg w-2/3 animate-pulse" />
        </div>
      </div>
    ),
    text: (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-lg w-5/6 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-lg w-4/6 animate-pulse" />
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      {skeletons.map((_, i) => (
        <div key={i}>{variants[variant]}</div>
      ))}
    </div>
  );
}
