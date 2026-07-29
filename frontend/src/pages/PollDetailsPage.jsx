import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Bookmark, Share2, Eye, Lock, ArrowLeft, Trash2, XCircle, BarChart3 } from "lucide-react";
import clsx from "clsx";
import { pollsApi } from "../api/polls";
import { commentsApi } from "../api/comments";
import { useAuth } from "../context/AuthContext";
import { buildCommentTree } from "../utils/buildCommentTree";
import { timeAgo } from "../utils/formatTime";
import { pollTypeMeta } from "../utils/pollMeta";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import PollVoter from "../components/polls/PollVoter";
import CommentThread from "../components/comments/CommentThread";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ErrorState from "../components/ui/ErrorState";

export default function PollDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c] = await Promise.all([pollsApi.get(id), commentsApi.list(id)]);
      setPoll(p);
      setComments(c);
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

  // Poll for fresh results every 8s so voters see the count move without a
  // websocket layer -- this backend doesn't have real-time push.
  useEffect(() => {
    if (!poll || poll.closed) return;
    const t = setInterval(async () => {
      try {
        const fresh = await pollsApi.get(id, { noview: true });
        setPoll(fresh);
      } catch {
        /* silent background refresh */
      }
    }, 8000);
    return () => clearInterval(t);
  }, [id, poll?.closed]);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  if (loading) return <PollDetailsSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!poll) return null;

  const meta = pollTypeMeta(poll.type);
  const isOwner = user && (poll.creator?._id === user._id || poll.creator === user._id);

  const applyVote = async (value) => {
    setVoting(true);
    try {
      await pollsApi.vote(poll._id, value);
      const fresh = await pollsApi.get(poll._id, { noview: true });
      setPoll(fresh);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setVoting(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      const { bookmarked } = await pollsApi.toggleBookmark(poll._id);
      setPoll((p) => ({ ...p, isBookmarked: bookmarked, saves: p.saves + (bookmarked ? 1 : -1) }));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const toggleClose = async () => {
    try {
      const { closed } = await pollsApi.toggleClose(poll._id);
      setPoll((p) => ({ ...p, closed }));
      toast.success(closed ? "Poll closed" : "Poll reopened");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const doDelete = async () => {
    try {
      await pollsApi.remove(poll._id);
      toast.success("Poll deleted");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onCommentAdded = (comment) => setComments((prev) => [comment, ...prev]);
  const onCommentRemoved = (commentId) =>
    setComments((prev) => prev.filter((c) => c._id !== commentId && c.parent !== commentId));

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="card p-6">
        <div className="flex items-start gap-3 mb-4">
          <Link to={`/u/${poll.creator?.username}`}>
            <Avatar src={poll.creator?.avatar} name={poll.creator?.name} size="md" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/u/${poll.creator?.username}`} className="font-semibold hover:underline block">
              {poll.creator?.name}
            </Link>
            <p className="text-xs text-gray-400">
              @{poll.creator?.username} · {timeAgo(poll.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge tone="primary">{meta.label}</Badge>
            {poll.closed && (
              <Badge tone="gray">
                <Lock className="h-3 w-3" /> Closed
              </Badge>
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1">{poll.question}</h1>
        {poll.category && <p className="text-sm text-gray-400 mb-5">{poll.category}</p>}

        <PollVoter poll={poll} voting={voting} onVote={applyVote} onOpenTextSubmit={applyVote} />

        <div className="flex items-center gap-5 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-gray-400">
          <span className="text-sm">{poll.totalVotes} votes</span>
          <span className="text-sm flex items-center gap-1">
            <Eye className="h-4 w-4" /> {poll.views} views
          </span>
          <button
            onClick={toggleBookmark}
            className={clsx("ml-auto text-sm flex items-center gap-1 hover:text-primary-600", poll.isBookmarked && "text-primary-600")}
          >
            <Bookmark className={clsx("h-4 w-4", poll.isBookmarked && "fill-current")} /> Save
          </button>
          <button onClick={share} className="text-sm flex items-center gap-1 hover:text-primary-600">
            <Share2 className="h-4 w-4" /> Share
          </button>
          {isOwner && (
            <Link to={`/polls/${poll._id}/analytics`} className="text-sm flex items-center gap-1 hover:text-primary-600">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-3 mt-4">
            <button onClick={toggleClose} className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-600">
              <XCircle className="h-3.5 w-3.5" /> {poll.closed ? "Reopen poll" : "Close poll"}
            </button>
            <button onClick={() => setConfirmDelete(true)} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" /> Delete poll
            </button>
          </div>
        )}
      </div>

      <div className="card p-6 mt-4">
        <h2 className="font-semibold mb-4">Discussion ({comments.length})</h2>
        <CommentThread pollId={poll._id} comments={commentTree} onAdded={onCommentAdded} onRemoved={onCommentRemoved} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        title="Delete this poll?"
        description="This permanently deletes the poll and all of its comments."
        confirmLabel="Delete poll"
      />
    </div>
  );
}

function PollDetailsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full skeleton" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded skeleton" />
            <div className="h-2.5 w-20 rounded skeleton" />
          </div>
        </div>
        <div className="h-5 w-3/4 rounded skeleton mb-4" />
        <div className="space-y-2">
          <div className="h-11 w-full rounded-xl skeleton" />
          <div className="h-11 w-full rounded-xl skeleton" />
          <div className="h-11 w-full rounded-xl skeleton" />
        </div>
      </div>
    </div>
  );
}
