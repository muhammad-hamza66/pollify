import PollCardSkeleton from "./PollCardSkeleton";

export default function ListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PollCardSkeleton key={i} />
      ))}
    </div>
  );
}
