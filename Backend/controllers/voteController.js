import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { notify } from "./notificationController.js";

// ─── Vote value validator per poll type ──────────────────────────────────────
const validateVoteValue = (poll, value) => {
    switch (poll.type) {
        case "single":
        case "image": {
            const idx = Number(value);
            if (!Number.isInteger(idx) || idx < 0 || idx >= poll.options.length) {
                return `Invalid option index — must be 0 to ${poll.options.length - 1}`;
            }
            break;
        }
        case "yesno": {
            const v = Number(value);
            if (v !== 0 && v !== 1) return "Value must be 0 (Yes) or 1 (No)";
            break;
        }
        case "rating": {
            const rating = Number(value);
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return "Rating must be an integer from 1 to 5";
            }
            break;
        }
        case "open": {
            if (typeof value !== "string" || value.trim().length === 0) {
                return "Answer cannot be empty";
            }
            if (value.length > 500) return "Answer is too long (max 500 characters)";
            break;
        }
        default:
            return "Unknown poll type";
    }
    return null;
};

// ─── Vote on a poll ──────────────────────────────────────────────────────────
export const votePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.closed) return res.status(400).json({ message: "This poll is closed" });

        // Prevent creator from voting on their own poll
        if (String(poll.creator) === String(req.userId)) {
            return res.status(400).json({ message: "You cannot vote on your own poll" });
        }

        const { value } = req.body;
        if (value === undefined || value === null || value === "") {
            return res.status(400).json({ message: "Vote value is required" });
        }

        // Validate value is appropriate for this poll type
        const validationError = validateVoteValue(poll, value);
        if (validationError) return res.status(400).json({ message: validationError });

        const hadVote = poll.votes.some((v) => String(v.user) === String(req.userId));
        poll.votes = poll.votes.filter((v) => String(v.user) !== String(req.userId));
        poll.votes.push({ user: req.userId, value });
        await poll.save();

        if (!hadVote) {
            await notify({ user: poll.creator, actor: req.userId, poll: poll._id, type: "vote" });
        }

        res.json({ message: "Vote recorded" });
    } catch (err) {
        console.error("votePoll error:", err.message);
        res.status(500).json({ message: "Failed to record vote. Please try again." });
    }
};

// ─── Remove vote (undo) ───────────────────────────────────────────────────────
export const removeVote = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.closed) return res.status(400).json({ message: "This poll is closed" });

        poll.votes = poll.votes.filter((v) => String(v.user) !== String(req.userId));
        await poll.save();
        res.json({ message: "Vote removed" });
    } catch (err) {
        console.error("removeVote error:", err.message);
        res.status(500).json({ message: "Failed to remove vote. Please try again." });
    }
};

// ─── Ownership guard ──────────────────────────────────────────────────────────
const ownerGuard = (poll, userId) => poll && String(poll.creator) === String(userId);

// ─── Update a poll (owner only) ──────────────────────────────────────────────
export const updatePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

        const { question, category } = req.body;
        if (question !== undefined && typeof question === "string" && question.trim()) {
            poll.question = question.trim().slice(0, 500);
        }
        if (category !== undefined && typeof category === "string") {
            poll.category = category.trim().slice(0, 50);
        }
        await poll.save();
        res.json({ message: "Poll updated" });
    } catch (err) {
        console.error("updatePoll error:", err.message);
        res.status(500).json({ message: "Failed to update poll. Please try again." });
    }
};

// ─── Toggle bookmark ──────────────────────────────────────────────────────────
export const toggleBookmark = async (req, res) => {
    try {
        // Verify the poll actually exists before bookmarking it
        const poll = await Poll.findById(req.params.id).select("_id");
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        const user = await User.findById(req.userId);
        const id = req.params.id;
        const has = user.bookmarks.some((b) => String(b) === String(id));
        user.bookmarks = has
            ? user.bookmarks.filter((b) => String(b) !== String(id))
            : [...user.bookmarks, id];
        await user.save();
        res.json({ bookmarked: !has });
    } catch (err) {
        console.error("toggleBookmark error:", err.message);
        res.status(500).json({ message: "Failed to update bookmark. Please try again." });
    }
};

// ─── Toggle poll open/closed (owner only) ────────────────────────────────────
export const closePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

        poll.closed = !poll.closed;
        await poll.save();
        res.json({ closed: poll.closed });
    } catch (err) {
        console.error("closePoll error:", err.message);
        res.status(500).json({ message: "Failed to update poll. Please try again." });
    }
};

// ─── Delete a poll and its comments (owner only) ─────────────────────────────
export const deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });

        await Comment.deleteMany({ poll: poll._id });
        await poll.deleteOne();
        res.json({ message: "Poll deleted" });
    } catch (err) {
        console.error("deletePoll error:", err.message);
        res.status(500).json({ message: "Failed to delete poll. Please try again." });
    }
};