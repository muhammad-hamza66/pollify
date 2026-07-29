import { useCallback, useEffect, useState } from "react";

// Generic list-loading hook shared by Explore/Dashboard/Saved/Profile.
// `fetcher` is any function returning a Promise<Poll[]> (already shaped
// by the backend's pollShape/withCounts utils).
export function usePolls(fetcher, deps = []) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher();
      setPolls(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  const removePoll = (id) => setPolls((prev) => prev.filter((p) => p._id !== id));

  return { polls, setPolls, loading, error, reload: load, removePoll };
}
