import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { shapePoll } from "../utils/pollShape.js";
import { withCounts } from "../utils/counts.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const POP = [{ path: "creator", select: "name username avatar" }];

// Allowed poll types and category format
const VALID_TYPES = new Set(["single", "yesno", "rating", "image", "open"]);

// bookmark id-set for logged-in users
const bookmarkSet = async (userId) => {
    const me = await User.findById(userId).select("bookmarks");
    return new Set((me?.bookmarks || []).map(String));
};

export const createPoll = async (req, res) => {
    try {
        const { question, type, category } = req.body;

        if (!question || typeof question !== "string" || !question.trim()) {
            return res.status(400).json({ message: "Question is required" });
        }
        if (!type || !VALID_TYPES.has(type)) {
            return res.status(400).json({ message: "Invalid poll type" });
        }

        const sanitizedQuestion = question.trim().slice(0, 500);
        const sanitizedCategory = (typeof category === "string" ? category.trim() : "General").slice(0, 50) || "General";

        let options = [];

        if (type === "yesno") {
            options = [{ text: "Yes" }, { text: "No" }];
        } else if (type === "single") {
            const parsed =
                typeof req.body.options === "string"
                    ? JSON.parse(req.body.options || "[]")
                    : req.body.options || [];

            if (!Array.isArray(parsed)) {
                return res.status(400).json({ message: "Options must be an array" });
            }

            options = parsed
                .filter((t) => t && typeof t === "string" && String(t).trim())
                .map((t) => ({ text: String(t).trim().slice(0, 200) }));

            if (options.length < 2 || options.length > 10) {
                return res.status(400).json({ message: "Single-choice polls require 2 to 10 options" });
            }
        } else if (type === "image") {
            if (!req.files || req.files.length < 2) {
                return res.status(400).json({ message: "Add at least 2 images" });
            }
            const urls = await Promise.all(
                req.files.map((file) => uploadToCloudinary(file.buffer))
            );
            options = urls.map((image) => ({ image, text: "" }));
        } else if (type === "rating" || type === "open") {
            options = [];
        }

        const poll = await Poll.create({
            question: sanitizedQuestion,
            type,
            category: sanitizedCategory,
            options,
            creator: req.userId,
        });

        return res.status(201).json({ success: true, message: "Poll created successfully", poll });
    } catch (error) {
        console.error("createPoll error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to create poll. Please try again." });
    }
};

const sendList = async (filter, req, res) => {
    const polls = await Poll.find(filter)
        .populate("creator", "name username avatar")
        .sort("-createdAt")
        .limit(200); // Prevent unbounded result sets

    const set = await bookmarkSet(req.userId);
    const shaped = polls.map((p) => shapePoll(p, req.userId, set));
    res.json(await withCounts(shaped));
};

export const listPolls = async (req, res) => {
    try {
        const filter = {};

        // Whitelist type — prevents operator injection via ?type[$gt]=
        const type = typeof req.query.type === "string" ? req.query.type : null;
        if (type && type !== "all") {
            if (!VALID_TYPES.has(type)) {
                return res.status(400).json({ message: "Invalid poll type filter" });
            }
            filter.type = type;
        }

        // Sanitize category string — strip any non-word characters
        const category = typeof req.query.category === "string" ? req.query.category : null;
        if (category) {
            filter.category = category.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 50);
        }

        if (req.query.feed === "following") {
            const me = await User.findById(req.userId).select("following");
            filter.creator = { $in: me?.following || [] };
        }

        await sendList(filter, req, res);
    } catch (err) {
        console.error("listPolls error:", err.message);
        res.status(500).json({ message: "Failed to load polls. Please try again." });
    }
};

export const getMyPolls = async (req, res) => {
    try {
        await sendList({ creator: req.userId }, req, res);
    } catch (err) {
        console.error("getMyPolls error:", err.message);
        res.status(500).json({ message: "Failed to load polls. Please try again." });
    }
};

export const getVotedPolls = async (req, res) => {
    try {
        await sendList({ "votes.user": req.userId }, req, res);
    } catch (err) {
        console.error("getVotedPolls error:", err.message);
        res.status(500).json({ message: "Failed to load polls. Please try again." });
    }
};

export const getBookmarks = async (req, res) => {
    try {
        const me = await User.findById(req.userId).populate({
            path: "bookmarks",
            populate: { path: "creator", select: "name username avatar" },
        });

        const set = new Set((me?.bookmarks || []).map((p) => String(p._id)));
        const shaped = (me?.bookmarks || []).map((p) => shapePoll(p, req.userId, set));

        res.json(await withCounts(shaped));
    } catch (err) {
        console.error("getBookmarks error:", err.message);
        res.status(500).json({ message: "Failed to load bookmarks. Please try again." });
    }
};

export const getTrending = async (req, res) => {
    try {
        const types = ["single", "yesno", "rating", "image", "open"];
        const counts = await Promise.all(types.map((t) => Poll.countDocuments({ type: t })));
        res.json(types.map((t, i) => ({ type: t, count: counts[i] })));
    } catch (err) {
        console.error("getTrending error:", err.message);
        res.status(500).json({ message: "Failed to load trending data. Please try again." });
    }
};

export const getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id).populate("creator", "name username avatar");
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        const creatorId = poll.creator?._id || poll.creator;
        const isCreator = String(creatorId) === String(req.userId);
        // Only the creator (or an explicit noview=true flag) skips the view increment
        const skipView = req.query.noview === "true" && isCreator;

        if (!isCreator && !skipView) {
            poll.views = (poll.views || 0) + 1;
            await poll.save();
        }

        const set = await bookmarkSet(req.userId);
        const [shaped] = await withCounts([shapePoll(poll, req.userId, set)]);
        res.json(shaped);
    } catch (err) {
        console.error("getPoll error:", err.message);
        res.status(500).json({ message: "Failed to load poll. Please try again." });
    }
};

export const getPollAnalytics = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id).populate("creator", "name username avatar");
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        const creatorId = poll.creator?._id || poll.creator;
        if (String(creatorId) !== String(req.userId)) {
            return res.status(403).json({ message: "Not your poll" });
        }

        const shaped = shapePoll(poll, req.userId);
        const comments = await Comment.countDocuments({ poll: poll._id });
        res.json({ poll: shaped, comments });
    } catch (err) {
        console.error("getPollAnalytics error:", err.message);
        res.status(500).json({ message: "Failed to load analytics. Please try again." });
    }
};