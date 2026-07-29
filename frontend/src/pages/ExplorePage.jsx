import { useMemo, useState } from "react";
import { Compass, Users } from "lucide-react";
import clsx from "clsx";
import { pollsApi } from "../api/polls";
import { usePolls } from "../hooks/usePolls";
import PollCard from "../components/polls/PollCard";
import ListSkeleton from "../components/skeletons/ListSkeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { POLL_TYPES } from "../utils/pollMeta";

const FEEDS = [
  { value: "all", label: "All polls" },
  { value: "following", label: "Following" },
];

export default function ExplorePage() {
  const [type, setType] = useState("all");
  const [feed, setFeed] = useState("all");

  const params = useMemo(() => {
    const p = {};
    if (type !== "all") p.type = type;
    if (feed === "following") p.feed = "following";
    return p;
  }, [type, feed]);

  const { polls, loading, error, reload, removePoll } = usePolls(
    () => pollsApi.list(params),
    [type, feed]
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary-600" /> Explore
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Discover what the community is voting on right now.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FEEDS.map((f) => (
          <FilterChip key={f.value} active={feed === f.value} onClick={() => setFeed(f.value)}>
            {f.value === "following" && <Users className="h-3.5 w-3.5" />}
            {f.label}
          </FilterChip>
        ))}
        <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        <FilterChip active={type === "all"} onClick={() => setType("all")}>
          All types
        </FilterChip>
        {POLL_TYPES.map((t) => (
          <FilterChip key={t.value} active={type === t.value} onClick={() => setType(t.value)}>
            {t.label}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <ListSkeleton count={9} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : polls.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={feed === "following" ? "Nobody you follow has posted yet" : "No polls match this filter"}
          description={feed === "following" ? "Follow more creators or switch back to all polls." : "Try a different poll type."}
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

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-primary-600 text-white"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      )}
    >
      {children}
    </button>
  );
}
