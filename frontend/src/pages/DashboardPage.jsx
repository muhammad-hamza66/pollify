import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PlusCircle, Vote, Bookmark, Users, Eye, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/users";
import { pollsApi } from "../api/polls";
import { usePolls } from "../hooks/usePolls";
import PollCard from "../components/polls/PollCard";
import ListSkeleton from "../components/skeletons/ListSkeleton";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { pollTypeMeta } from "../utils/pollMeta";

const PIE_COLORS = ["#3b82f6", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"];

export default function DashboardPage() {
  const { user, stats } = useAuth();
  const { polls, loading, error, reload, removePoll } = usePolls(() => pollsApi.getMine(), []);
  const [typeCounts, setTypeCounts] = useState([]);
  const [followStats, setFollowStats] = useState(null);

  useEffect(() => {
    pollsApi.getTrendingCounts().then(setTypeCounts).catch(() => {});
    if (user?.username) {
      usersApi.getProfile(user.username).then((d) => setFollowStats(d.stats)).catch(() => {});
    }
  }, [user?.username]);

  const topPolls = [...polls].sort((a, b) => b.totalVotes - a.totalVotes).slice(0, 5);
  const barData = topPolls.map((p) => ({
    name: p.question.length > 18 ? p.question.slice(0, 18) + "…" : p.question,
    votes: p.totalVotes,
  }));
  const pieData = typeCounts.filter((t) => t.count > 0).map((t) => ({ name: pollTypeMeta(t.type).label, value: t.count }));
  const totalVotesReceived = polls.reduce((s, p) => s + p.totalVotes, 0);
  const totalViews = polls.reduce((s, p) => s + p.views, 0);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Here's how your polls are performing.</p>
        </div>
        <Link to="/create" className="btn bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow">
          <PlusCircle className="h-4 w-4" /> Create Poll
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Vote} label="Polls created" value={stats?.created ?? 0} />
        <StatCard icon={Users} label="Votes received" value={totalVotesReceived} />
        <StatCard icon={Bookmark} label="Bookmarked by you" value={stats?.bookmarked ?? 0} />
        <StatCard icon={Eye} label="Total views" value={totalViews} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-semibold mb-4">Your top polls by votes</h2>
          {barData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">Create a poll to see your stats here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,.12)", fontSize: 12 }}
                />
                <Bar dataKey="votes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Poll types on Pollify</h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No platform data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <span key={d.name} className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /> {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {followStats && (
        <div className="card p-5 flex items-center gap-8">
          <div>
            <p className="text-xl font-bold">{followStats.followers}</p>
            <p className="text-xs text-gray-400">Followers</p>
          </div>
          <div>
            <p className="text-xl font-bold">{followStats.following}</p>
            <p className="text-xs text-gray-400">Following</p>
          </div>
          <div>
            <p className="text-xl font-bold">{followStats.voted}</p>
            <p className="text-xs text-gray-400">Polls you voted on</p>
          </div>
          <Link to={`/u/${user?.username}`} className="ml-auto text-sm text-primary-600 flex items-center gap-1 hover:underline">
            View profile <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">My recent polls</h2>
          <Link to="/explore" className="text-sm text-primary-600 hover:underline">
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
              <Link to="/create" className="btn bg-primary-600 text-white px-4 py-2 text-sm">
                Create a poll
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {polls.slice(0, 6).map((p) => (
              <PollCard key={p._id} poll={p} onRemoved={removePoll} showOwnerActions />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}
