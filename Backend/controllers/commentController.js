import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Poll from "../models/Poll.js";
import { notify } from "./notificationController.js";

// Get all comments for a poll
export const getComments = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.pollId)) {
            return res.status(400).json({ message: "Invalid poll ID" });
        }

        const comments = await Comment.find({ poll: req.params.pollId })
            .populate("user", "name username avatar")
            .sort("-createdAt")
            .limit(500); // Prevent unbounded results

        res.json(comments);
    } catch (err) {
        console.error("getComments error:", err.message);
        res.status(500).json({ message: "Failed to load comments. Please try again." });
    }
};

export const addComment = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.pollId)) {
            return res.status(400).json({ message: "Invalid poll ID" });
        }

        const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
        if (!text) return res.status(400).json({ message: "Comment cannot be empty" });
        if (text.length > 1000) return res.status(400).json({ message: "Comment is too long (max 1000 characters)" });

        // Validate parent comment exists and belongs to the same poll
        let parent = null;
        if (req.body.parent) {
            if (!mongoose.Types.ObjectId.isValid(req.body.parent)) {
                return res.status(400).json({ message: "Invalid parent comment ID" });
            }
            const parentComment = await Comment.findById(req.body.parent).select("poll");
            if (!parentComment || String(parentComment.poll) !== String(req.params.pollId)) {
                return res.status(400).json({ message: "Invalid parent comment" });
            }
            parent = req.body.parent;
        }

        const comment = await Comment.create({
            poll: req.params.pollId,
            user: req.userId,
            parent,
            text,
        });

        const populated = await comment.populate("user", "name username avatar");
        const poll = await Poll.findById(req.params.pollId).select("creator");
        if (poll) {
            await notify({ user: poll.creator, actor: req.userId, poll: poll._id, type: "comment" });
        }

        res.status(201).json(populated);
    } catch (err) {
        console.error("addComment error:", err.message);
        res.status(500).json({ message: "Failed to add comment. Please try again." });
    }
};

// Author removes their own comment and all its replies
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (String(comment.user) !== String(req.userId)) {
            return res.status(403).json({ message: "Not your comment" });
        }

        await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("deleteComment error:", err.message);
        res.status(500).json({ message: "Failed to delete comment. Please try again." });
    }
};