export default function PollCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-full skeleton" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-28 rounded skeleton" />
          <div className="h-2.5 w-20 rounded skeleton" />
        </div>
        <div className="h-5 w-16 rounded-md skeleton" />
      </div>
      <div className="h-4 w-3/4 rounded skeleton mb-3" />
      <div className="space-y-1.5">
        <div className="h-10 w-full rounded-xl skeleton" />
        <div className="h-10 w-full rounded-xl skeleton" />
      </div>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#e2e8f0] dark:border-gray-800">
        <div className="h-3 w-14 rounded skeleton" />
        <div className="h-3 w-10 rounded skeleton" />
        <div className="h-3 w-10 rounded skeleton" />
      </div>
    </div>
  );
}
