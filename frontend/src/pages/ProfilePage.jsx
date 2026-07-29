import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus, UserCheck, Users, Vote } from "lucide-react";
import { usersApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import PollCard from "../components/polls/PollCard";
import PageLoader from "../components/ui/PageLoader";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(null); // "followers" | "following" | null
  const [connections, setConnections] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await usersApi.getProfile(username));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const toggleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await usersApi.toggleFollow(username);
      setData((d) => ({ ...d, isFollowing: res.following, stats: { ...d.stats, followers: res.followers } }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const openConnections = async (tab) => {
    setConnectionsOpen(tab);
    try {
      setConnections(await usersApi.getConnections(username));
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { user, isFollowing, isMe, stats, polls } = data;

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar src={user.avatar} name={user.name} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-gray-400">@{user.username}</p>
            {user.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{user.bio}</p>}
          </div>
          {isMe ? (
            <Link to="/settings" className="btn border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm">
              Edit profile
            </Link>
          ) : (
            <Button variant={isFollowing ? "outline" : "primary"} loading={followLoading} onClick={toggleFollow}>
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4" /> Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Follow
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Stat value={stats.created} label="Polls" />
          <Stat value={stats.voted} label="Voted" />
          <button onClick={() => openConnections("followers")} className="text-left">
            <Stat value={stats.followers} label="Followers" />
          </button>
          <button onClick={() => openConnections("following")} className="text-left">
            <Stat value={stats.following} label="Following" />
          </button>
        </div>
      </div>

      <h2 className="font-semibold mb-4">Polls by {user.name}</h2>
      {polls.length === 0 ? (
        <EmptyState icon={Vote} title="No polls yet" description={`${user.name} hasn't created any polls.`} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {polls.map((p) => (
            <PollCard key={p._id} poll={p} />
          ))}
        </div>
      )}

      <Modal open={!!connectionsOpen} onClose={() => setConnectionsOpen(null)} title={connectionsOpen === "followers" ? "Followers" : "Following"}>
        {!connections ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading...</p>
        ) : (
          <div className="max-h-80 overflow-y-auto scrollbar-thin -mx-2">
            {(connections[connectionsOpen] || []).length === 0 ? (
              <EmptyState icon={Users} title="Nobody here yet" />
            ) : (
              connections[connectionsOpen].map((u) => (
                <Link
                  key={u._id}
                  to={`/u/${u.username}`}
                  onClick={() => setConnectionsOpen(null)}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Avatar src={u.avatar} name={u.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
