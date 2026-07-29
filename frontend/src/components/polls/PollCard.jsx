import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Bookmark, MessageCircle, Eye, Share2, Lock, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import clsx from "clsx";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import PollVoter from "./PollVoter";
import { pollsApi } from "../../api/polls";
import { timeAgo } from "../../utils/formatTime";
import { pollTypeMeta } from "../../utils/pollMeta";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function PollCard({ poll: initialPoll, onRemoved, showOwnerActions = false }) {
  const [poll, setPoll] = useState(initialPoll);
  const [voting, setVoting] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const meta = pollTypeMeta(poll.type);
  const isOwner = user && (poll.creator?._id === user._id || poll.creator === user._id);

  const applyVote = async (value) => {
    if (poll.closed || voting) return;
    setVoting(true);
    const prev = poll;
    try {
      await pollsApi.vote(poll._id, value);
      const fresh = await pollsApi.get(poll._id, { noview: true });
      setPoll(fresh);
    } catch (e) {
      setPoll(prev);
      toast.error(e.message);
    } finally {
      setVoting(false);
    }
  };

  const toggleBookmark = async () => {
    setBookmarking(true);
    try {
      const { bookmarked } = await pollsApi.toggleBookmark(poll._id);
      setPoll((p) => ({ ...p, isBookmarked: bookmarked, saves: p.saves + (bookmarked ? 1 : -1) }));
      toast.success(bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBookmarking(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/polls/${poll._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const toggleClose = async () => {
    try {
      const { closed } = await pollsApi.toggleClose(poll._id);
      setPoll((p) => ({ ...p, closed }));
      toast.success(closed ? "Poll closed" : "Poll reopened");
    } catch (e) {
      toast.error(e.message);
    }
    setMenuOpen(false);
  };

  const doDelete = async () => {
    try {
      await pollsApi.remove(poll._id);
      toast.success("Poll deleted");
      onRemoved?.(poll._id);
    } catch (e) {
      toast.error(e.message);
    }
    setConfirmDelete(false);
  };

  return (
    <article className="card p-5 flex flex-col animate-fade-up">
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/u/${poll.creator?.username}`}>
          <Avatar src={poll.creator?.avatar} name={poll.creator?.name} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/u/${poll.creator?.username}`} className="text-sm font-semibold hover:underline truncate block">
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
          {(isOwner || showOwnerActions) && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Poll options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-40 card p-1 z-10 shadow-lg">
                  <button
                    onClick={toggleClose}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <XCircle className="h-3.5 w-3.5" /> {poll.closed ? "Reopen poll" : "Close poll"}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDelete(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Link to={`/polls/${poll._id}`} className="block mb-3 group">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-primary-600 transition-colors">
          {poll.question}
        </h3>
        {poll.category && <span className="text-xs text-gray-400">{poll.category}</span>}
      </Link>

      <PollVoter
        poll={poll}
        voting={voting}
        onVote={applyVote}
        onOpenTextSubmit={applyVote}
        compact
      />

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-400">
        <span className="text-xs flex items-center gap-1">{poll.totalVotes} votes</span>
        <Link to={`/polls/${poll._id}`} className="text-xs flex items-center gap-1 hover:text-primary-600">
          <MessageCircle className="h-3.5 w-3.5" /> {poll.comments}
        </Link>
        <span className="text-xs flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" /> {poll.views}
        </span>
        <button
          onClick={toggleBookmark}
          disabled={bookmarking}
          className={clsx("ml-auto text-xs flex items-center gap-1 hover:text-primary-600", poll.isBookmarked && "text-primary-600")}
          aria-pressed={poll.isBookmarked}
          aria-label="Bookmark poll"
        >
          <Bookmark className={clsx("h-3.5 w-3.5", poll.isBookmarked && "fill-current")} /> {poll.saves}
        </button>
        <button onClick={share} className="text-xs flex items-center gap-1 hover:text-primary-600" aria-label="Share poll">
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        title="Delete this poll?"
        description="This permanently deletes the poll and all of its comments. This can't be undone."
        confirmLabel="Delete poll"
      />
    </article>
  );
}
