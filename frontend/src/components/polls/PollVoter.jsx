import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";
import clsx from "clsx";

/**
 * Renders the interactive vote UI for a single poll, matching exactly what
 * the backend can store: one `value` per vote (see models/Poll.js voteSchema
 * + controllers/voteController.js). There is no multi-select on this backend.
 *
 * - single / image: value = option index
 * - yesno: value = 0 ("Yes") | 1 ("No")
 * - rating: value = 1..5
 * - open: value = free-text string
 *
 * `poll.results` / `poll.myVote` come pre-computed from utils/pollShape.js.
 * Once the user has voted (or poll is closed), we show results instead of
 * the input controls.
 */
export default function PollVoter({ poll, onVote, onOpenTextSubmit, voting, compact = false }) {
  const [openText, setOpenText] = useEsc();
  const hasVoted = poll.myVote !== null && poll.myVote !== undefined;
  const showResults = hasVoted || poll.closed;

  if (poll.type === "open") {
    if (showResults) {
      return <OpenResults results={poll.results} compact={compact} />;
    }
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (openText.trim()) onOpenTextSubmit(openText.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={openText}
          onChange={(e) => setOpenText(e.target.value)}
          placeholder="Type your answer..."
          className="input flex-1"
          maxLength={280}
        />
        <button
          type="submit"
          disabled={voting || !openText.trim()}
          className="btn bg-primary-600 text-white hover:bg-primary-700 px-4 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    );
  }

  if (poll.type === "rating") {
    return (
      <RatingVoter
        results={poll.results}
        myVote={poll.myVote}
        showResults={showResults}
        onVote={onVote}
        voting={voting}
        closed={poll.closed}
      />
    );
  }

  // single / yesno / image all render as option bars
  return (
    <div className={clsx("space-y-2", compact && "space-y-1.5")}>
      {poll.results.map((opt) => (
        <OptionRow
          key={opt.index}
          option={opt}
          type={poll.type}
          selected={poll.myVote === opt.index}
          showResults={showResults}
          disabled={voting || poll.closed}
          onClick={() => onVote(opt.index)}
          compact={compact}
        />
      ))}
    </div>
  );
}

function useEsc() {
  return useState("");
}

function OptionRow({ option, type, selected, showResults, disabled, onClick, compact }) {
  if (!showResults) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          "w-full flex items-center gap-3 rounded-xl border text-left transition-colors",
          "border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-500/5",
          compact ? "px-3 py-2 text-sm" : "px-4 py-3"
        )}
      >
        {type === "image" && option.image && (
          <img src={option.image} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
        )}
        <span className="flex-1 font-medium text-gray-700 dark:text-gray-200">{option.text}</span>
      </button>
    );
  }

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-xl border",
        selected ? "border-primary-400" : "border-gray-200 dark:border-gray-700",
        compact ? "px-3 py-2 text-sm" : "px-4 py-3"
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${option.percent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={clsx(
          "absolute inset-y-0 left-0",
          selected ? "bg-primary-100 dark:bg-primary-500/15" : "bg-gray-100 dark:bg-gray-800/60"
        )}
      />
      <div className="relative flex items-center gap-3">
        {type === "image" && option.image && (
          <img src={option.image} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
        )}
        <span className="flex-1 font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
          {selected && <Check className="h-3.5 w-3.5 text-primary-600" />}
          {option.text}
        </span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
          {option.percent}% <span className="font-normal">({option.count})</span>
        </span>
      </div>
    </div>
  );
}

function RatingVoter({ results, myVote, showResults, onVote, voting, closed }) {
  const [hover, setHover] = useState(0);

  if (showResults) {
    const total = results.reduce((s, r) => s + r.count, 0);
    return (
      <div className="space-y-1.5">
        {[...results].reverse().map((r) => (
          <div key={r.star} className="flex items-center gap-2 text-sm">
            <span className="w-10 text-gray-500 flex items-center gap-0.5">
              {r.star}<Star className="h-3 w-3 fill-current text-amber-400" />
            </span>
            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${r.percent}%` }}
                className="h-full bg-amber-400"
              />
            </div>
            <span className="w-8 text-right text-xs text-gray-400 tabular-nums">{r.count}</span>
          </div>
        ))}
        {total > 0 && (
          <p className="text-xs text-gray-400 pt-1">
            Average: {(results.reduce((s, r) => s + r.star * r.count, 0) / total).toFixed(1)} / 5
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rate from 1 to 5 stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          role="radio"
          aria-checked={myVote === star}
          disabled={voting || closed}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onVote(star)}
          className="p-1"
        >
          <Star
            className={clsx(
              "h-7 w-7 transition-colors",
              (hover || myVote) >= star ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function OpenResults({ results, compact }) {
  if (!results?.length) {
    return <p className="text-sm text-gray-400 italic">No answers yet.</p>;
  }
  return (
    <div className={clsx("space-y-2 max-h-56 overflow-y-auto scrollbar-thin pr-1", compact && "max-h-32")}>
      {results.map((r, i) => (
        <div key={i} className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
          {r.text}
        </div>
      ))}
    </div>
  );
}
