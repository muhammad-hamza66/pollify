import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { pollsApi } from "../api/polls";
import PollCard from "../components/polls/PollCard";
import ListSkeleton from "../components/skeletons/ListSkeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Input from "../components/ui/Input";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const [allPolls, setAllPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    pollsApi
      .list()
      .then(setAllPolls)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return allPolls.filter(
      (p) =>
        p.question.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.creator?.name?.toLowerCase().includes(term) ||
        p.creator?.username?.toLowerCase().includes(term)
    );
  }, [allPolls, q]);

  const submit = (e) => {
    e.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {});
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-4 text-[#0f172a] dark:text-white">
          <SearchIcon className="h-5 w-5 text-primary-600" /> Search
        </h1>
        <form onSubmit={submit} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search polls by question, category, or creator…"
            className="pl-11 py-3"
            autoFocus
          />
        </form>
      </div>

      {!q ? (
        <p className="text-sm text-[#94a3b8] text-center py-16">
          Type something and hit enter to search.
        </p>
      ) : loading ? (
        <ListSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={`No results for "${q}"`}
          description="Try a different keyword, or explore all polls instead."
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
        <>
          <p className="text-sm text-[#94a3b8]">
            <span className="font-medium text-[#0f172a] dark:text-gray-200">
              {results.length}
            </span>{" "}
            result{results.length !== 1 && "s"} for "{q}"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((p) => (
              <PollCard key={p._id} poll={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
