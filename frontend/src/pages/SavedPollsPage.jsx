import { Bookmark } from "lucide-react";
import { pollsApi } from "../api/polls";
import { usePolls } from "../hooks/usePolls";
import PollCard from "../components/polls/PollCard";
import ListSkeleton from "../components/skeletons/ListSkeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { Link } from "react-router-dom";

export default function SavedPollsPage() {
  const { polls, loading, error, reload, removePoll } = usePolls(
    () => pollsApi.getBookmarks(),
    []
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#0f172a] dark:text-white">
          <Bookmark className="h-5 w-5 text-primary-600" /> Saved Polls
        </h1>
        <p className="text-sm text-[#64748b] dark:text-gray-400 mt-0.5">
          Polls you bookmarked to revisit later.
        </p>
      </div>

      {loading ? (
        <ListSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : polls.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark icon on any poll to save it here."
          action={
            <Link
              to="/explore"
              className="btn bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 text-sm shadow-sm shadow-primary-600/20"
            >
              Explore polls
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {polls.map((p) => (
            <PollCard key={p._id} poll={p} onRemoved={removePoll} />
          ))}
        </div>
      )}
    </div>
  );
}
