import { TrendingUp } from "lucide-react";
import { pollsApi } from "../api/polls";
import { usePolls } from "../hooks/usePolls";
import PollCard from "../components/polls/PollCard";
import ListSkeleton from "../components/skeletons/ListSkeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";

// The backend's /polls/trending endpoint only returns per-type totals
// ({ type, count }), not a ranked list of poll documents. To give users an
// actual "trending" feed, we fetch the full list and rank it client-side by
// an engagement score (votes weighted higher than passive views).
export default function TrendingPage() {
  const { polls, loading, error, reload } = usePolls(() => pollsApi.list(), []);
  const ranked = [...polls]
    .filter((p) => !p.closed)
    .sort((a, b) => b.totalVotes * 2 + b.views - (a.totalVotes * 2 + a.views))
    .slice(0, 30);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent-600" /> Trending
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ranked by votes and views across the community.</p>
      </div>

      {loading ? (
        <ListSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : ranked.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Nothing trending yet" description="Once polls start getting votes, they'll show up here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ranked.map((p, i) => (
            <div key={p._id} className="relative">
              {i < 3 && (
                <span className="absolute -top-2 -left-2 z-10 h-7 w-7 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  #{i + 1}
                </span>
              )}
              <PollCard poll={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
