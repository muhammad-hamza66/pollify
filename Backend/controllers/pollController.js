import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { shapePoll } from "../utils/pollShape.js";
import { withCounts } from "../utils/counts.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const POP = [{ path: "creator", select: "name username avatar" }];

// bookmark id-set for logged-in users
const bookmarkSet = async (userId) => {
    const me = await User.findById(userId).select("bookmarks");
    return new Set((me?.bookmarks || []).map(String));
};

export const createPoll = async (req, res) => {
    try {
        const { question, type, category } = req.body;

        if (!question || !type) {
            return res.status(400).json({
                message: "Question and type are required",
            });
        }

        let options = [];

        if (type === "yesno") {
            options = [
                { text: "Yes" },
                { text: "No" },
            ];
        } else if (type === "single") {
            const parsed = typeof req.body.options === 'string'
                ? JSON.parse(req.body.options || "[]")
                : (req.body.options || []);

            options = parsed
                .filter((t) => t && String(t).trim())
                .map((t) => ({
                    text: String(t).trim(),
                }));

            if (options.length < 2) {
                return res.status(400).json({
                    message: "Add at least 2 options",
                });
            }
        } else if (type === "image") {
            if (!req.files || req.files.length < 2) {
                return res.status(400).json({
                    message: "Add at least 2 images",
                });
            }

            const urls = await Promise.all(
                req.files.map((file) => uploadToCloudinary(file.buffer))
            );

            options = urls.map((image) => ({
                image,
                text: "",
            }));
        } else if (type === "rating" || type === "open") {
            options = [];
        } else {
            return res.status(400).json({
                message: "Invalid poll type",
            });
        }

        const poll = await Poll.create({
            question,
            type,
            category: category || "General",
            options,
            creator: req.userId,
        });

        return res.status(201).json({
            success: true,
            message: "Poll created successfully",
            poll,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

const sendList = async (filter, req, res) => {
    const polls = await Poll.find(filter)
        .populate("creator", "name username avatar")
        .sort("-createdAt");

    const set = await bookmarkSet(req.userId);
    const shaped = polls.map((p) => shapePoll(p, req.userId, set));
    res.json(await withCounts(shaped));
};

export const listPolls = async (req, res) => {
    try {
        const filter = {};
        if (req.query.type && req.query.type !== "all")
            filter.type = req.query.type;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.feed === "following") {
            const me = await User.findById(req.userId).select("following");
            filter.creator = { $in: me?.following || [] };
        }

        await sendList(filter, req, res);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getMyPolls = async (req, res) => {
    try {
        await sendList({ creator: req.userId }, req, res);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getVotedPolls = async (req, res) => {
    try {
        await sendList({ "votes.user": req.userId }, req, res);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getBookmarks = async (req, res) => {
    try {
        const me = await User.findById(req.userId).populate({
            path: "bookmarks",
            populate: { path: "creator", select: "name username avatar" }
        });

        const set = new Set((me?.bookmarks || []).map((p) => String(p._id)));
        const shaped = (me?.bookmarks || []).map((p) =>
            shapePoll(p, req.userId, set));

        res.json(await withCounts(shaped));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTrending = async (req, res) => {
    try {
        const types = ["single", "yesno", "rating", "image", "open"];
        const counts = await Promise.all(
            types.map((t) => Poll.countDocuments({ type: t }))
        );
        res.json(types.map((t, i) => ({
            type: t,
            count: counts[i]
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id).populate("creator", "name username avatar");
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        const creatorId = poll.creator?._id || poll.creator;
        const isCreator = String(creatorId) === String(req.userId);
        const skipView = req.query.noview === "true";

        if (!isCreator && !skipView) {
            poll.views = (poll.views || 0) + 1;
            await poll.save();
        }

        const set = await bookmarkSet(req.userId);
        const [shaped] = await withCounts([shapePoll(poll, req.userId, set)]);
        res.json(shaped);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPollAnalytics = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id).populate("creator", "name username avatar");
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        const creatorId = poll.creator?._id || poll.creator;
        if (String(creatorId) !== String(req.userId))
            return res.status(403).json({ message: "Not your poll" });

        const shaped = shapePoll(poll, req.userId);
        const comments = await Comment.countDocuments({ poll: poll._id });
        res.json({ poll: shaped, comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};