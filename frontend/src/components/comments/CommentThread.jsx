import { useState } from "react";
import toast from "react-hot-toast";
import { Reply, Trash2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { commentsApi } from "../../api/comments";
import { useAuth } from "../../context/AuthContext";
import { timeAgo } from "../../utils/formatTime";
import Avatar from "../ui/Avatar";

export default function CommentThread({ pollId, comments, onAdded, onRemoved }) {
  return (
    <div className="space-y-4">
      <ComposeBox pollId={pollId} onAdded={onAdded} />
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No comments yet. Start the discussion.</p>
      ) : (
        comments.map((c) => (
          <CommentNode key={c._id} comment={c} pollId={pollId} onAdded={onAdded} onRemoved={onRemoved} depth={0} />
        ))
      )}
    </div>
  );
}

function ComposeBox({ pollId, onAdded, parent = null, autoFocus = false, onDone }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const comment = await commentsApi.add(pollId, { text: text.trim(), parent });
      onAdded(comment, parent);
      setText("");
      onDone?.();
    } catch (e2) {
      toast.error(e2.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-3">
      <Avatar src={user?.avatar} name={user?.name} size="sm" />
      <div className="flex-1 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={parent ? "Write a reply..." : "Add a comment..."}
          className="input flex-1"
          autoFocus={autoFocus}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn bg-primary-600 text-white hover:bg-primary-700 px-3 disabled:opacity-40"
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function CommentNode({ comment, pollId, onAdded, onRemoved, depth }) {
  const [replying, setReplying] = useState(false);
  const { user } = useAuth();
  const isMine = user && comment.user?._id === user._id;

  const remove = async () => {
    try {
      await commentsApi.remove(comment._id);
      onRemoved(comment._id);
      toast.success("Comment deleted");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className={depth > 0 ? "ml-10 pl-4 border-l border-gray-100 dark:border-gray-800" : ""}>
      <div className="flex gap-3">
        <Link to={`/u/${comment.user?.username}`}>
          <Avatar src={comment.user?.avatar} name={comment.user?.name} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-4 py-2.5">
            <Link to={`/u/${comment.user?.username}`} className="text-sm font-semibold hover:underline">
              {comment.user?.name}
            </Link>
            <p className="text-sm text-gray-700 dark:text-gray-200 mt-0.5 break-words">{comment.text}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-2">
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
            <button
              onClick={() => setReplying((v) => !v)}
              className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1"
            >
              <Reply className="h-3 w-3" /> Reply
            </button>
            {isMine && (
              <button onClick={remove} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>
          {replying && (
            <div className="mt-2">
              <ComposeBox pollId={pollId} onAdded={onAdded} parent={comment._id} autoFocus onDone={() => setReplying(false)} />
            </div>
          )}
        </div>
      </div>
      {comment.replies?.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((r) => (
            <CommentNode key={r._id} comment={r} pollId={pollId} onAdded={onAdded} onRemoved={onRemoved} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
