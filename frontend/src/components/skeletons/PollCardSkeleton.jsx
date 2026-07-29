export default function PollCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-2.5 w-16 rounded skeleton" />
        </div>
      </div>
      <div className="h-4 w-3/4 rounded skeleton mb-3" />
      <div className="space-y-2">
        <div className="h-9 w-full rounded-xl skeleton" />
        <div className="h-9 w-full rounded-xl skeleton" />
      </div>
    </div>
  );
}
