import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BarChart3, ArrowLeft, MessageCircle, Eye, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { pollsApi } from "../api/polls";
import PageLoader from "../components/ui/PageLoader";
import ErrorState from "../components/ui/ErrorState";
import { pollTypeMeta } from "../utils/pollMeta";

export default function PollAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await pollsApi.getAnalytics(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { poll, comments } = data;
  const meta = pollTypeMeta(poll.type);
  const chartData =
    poll.type === "rating"
      ? poll.results.map((r) => ({ name: `${r.star}★`, count: r.count }))
      : poll.type === "open"
      ? []
      : poll.results.map((r) => ({ name: r.text?.slice(0, 14) || `Option ${r.index + 1}`, count: r.count }));

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="h-5 w-5 text-primary-600" />
        <h1 className="text-xl font-bold">Poll analytics</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to={`/polls/${poll._id}`} className="hover:underline">
          {poll.question}
        </Link>{" "}
        · {meta.label}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MiniStat icon={Users} label="Total votes" value={poll.totalVotes} />
        <MiniStat icon={Eye} label="Views" value={poll.views} />
        <MiniStat icon={MessageCircle} label="Comments" value={comments} />
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Vote breakdown</h2>
        {poll.type === "open" ? (
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {poll.results.length === 0 ? (
              <p className="text-sm text-gray-400">No answers submitted yet.</p>
            ) : (
              poll.results.map((r, i) => (
                <div key={i} className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2 text-sm">
                  {r.text}
                </div>
              ))
            )}
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-gray-400">No votes yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="card p-4 text-center">
      <Icon className="h-4 w-4 text-primary-500 mx-auto mb-1.5" />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
