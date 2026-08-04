import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  PlusCircle,
  Vote,
  Bookmark,
  Users,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/users";
import { pollsApi } from "../api/polls";
import { usePolls } from "../hooks/usePolls";
import PollCard from "../components/polls/PollCard";
import ListSkeleton from "../components/skeletons/ListSkeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { pollTypeMeta } from "../utils/pollMeta";

const PIE_COLORS = ["#22c55e", "#8b5cf6", "#f59e0b", "#3b82f6", "#ef4444"];

export default function DashboardPage() {
  const { user, stats } = useAuth();
  const { polls, loading, error, reload, removePoll } = usePolls(
    () => pollsApi.getMine(),
    []
  );
  const [typeCounts, setTypeCounts] = useState([]);
  const [followStats, setFollowStats] = useState(null);

  useEffect(() => {
    pollsApi
      .getTrendingCounts()
      .then(setTypeCounts)
      .catch(() => {});
    if (user?.username) {
      usersApi
        .getProfile(user.username)
        .then((d) => setFollowStats(d.stats))
        .catch(() => {});
    }
  }, [user?.username]);

  const topPolls = [...polls]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 5);
  const barData = topPolls.map((p) => ({
    name:
      p.question.length > 18 ? p.question.slice(0, 18) + "…" : p.question,
    votes: p.totalVotes,
  }));
  const pieData = typeCounts
    .filter((t) => t.count > 0)
    .map((t) => ({ name: pollTypeMeta(t.type).label, value: t.count }));
  const totalVotesReceived = polls.reduce((s, p) => s + p.totalVotes, 0);
  const totalViews = polls.reduce((s, p) => s + p.views, 0);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[#64748b] dark:text-gray-400 mt-0.5">
            Here's how your polls are performing.
          </p>
        </div>
        <Link
          to="/create"
          className="btn bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20 hover:shadow-md hover:shadow-primary-600/25"
        >
          <PlusCircle className="h-4 w-4" /> Create Poll
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Vote}
          label="Polls created"
          value={stats?.created ?? 0}
          color="text-primary-600"
          bg="bg-primary-50 dark:bg-primary-500/10"
        />
        <StatCard
          icon={Users}
          label="Votes received"
          value={totalVotesReceived}
          color="text-secondary-600"
          bg="bg-secondary-50 dark:bg-secondary-500/10"
        />
        <StatCard
          icon={Bookmark}
          label="Bookmarked"
          value={stats?.bookmarked ?? 0}
          color="text-accent-600"
          bg="bg-accent-50 dark:bg-accent-500/10"
        />
        <StatCard
          icon={Eye}
          label="Total views"
          value={totalViews}
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold text-[#0f172a] dark:text-gray-100 mb-4">
            Your top polls by votes
          </h2>
          {barData.length === 0 ? (
            <p className="text-sm text-[#94a3b8] py-10 text-center">
              Create a poll to see your stats here.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(34,197,94,0.06)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 4px 6px -1px rgba(15,23,42,.08), 0 12px 24px -4px rgba(15,23,42,.12)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="votes" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-[#0f172a] dark:text-gray-100 mb-4">
            Poll types on Pollify
          </h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-[#94a3b8] py-10 text-center">
              No platform data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <span
                key={d.name}
                className="text-xs flex items-center gap-1.5 text-[#64748b]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: PIE_COLORS[i % PIE_COLORS.length],
                  }}
                />{" "}
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Follow stats */}
      {followStats && (
        <div className="card p-5 flex items-center gap-8">
          <div>
            <p className="text-xl font-bold text-[#0f172a] dark:text-white">
              {followStats.followers}
            </p>
            <p className="text-xs text-[#94a3b8]">Followers</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#0f172a] dark:text-white">
              {followStats.following}
            </p>
            <p className="text-xs text-[#94a3b8]">Following</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#0f172a] dark:text-white">
              {followStats.voted}
            </p>
            <p className="text-xs text-[#94a3b8]">Polls you voted on</p>
          </div>
          <Link
            to={`/u/${user?.username}`}
            className="ml-auto text-sm text-primary-600 flex items-center gap-1 hover:underline font-medium"
          >
            View profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Recent polls */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0f172a] dark:text-gray-100">
            My recent polls
          </h2>
          <Link
            to="/explore"
            className="text-sm text-primary-600 hover:underline font-medium"
          >
            Explore all polls
          </Link>
        </div>
        {loading ? (
          <ListSkeleton count={3} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : polls.length === 0 ? (
          <EmptyState
            icon={Vote}
            title="No polls yet"
            description="Create your first poll and see votes roll in right here."
            action={
              <Link
                to="/create"
                className="btn bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 text-sm shadow-sm shadow-primary-600/20"
              >
                Create a poll
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {polls.slice(0, 6).map((p) => (
              <PollCard
                key={p._id}
                poll={p}
                onRemoved={removePoll}
                showOwnerActions
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-xl font-bold leading-none text-[#0f172a] dark:text-white">
          {value}
        </p>
        <p className="text-xs text-[#94a3b8] mt-1">{label}</p>
      </div>
    </div>
  );
}
