import express from "express";
import { protect } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
    createPoll,
    getBookmarks,
    getMyPolls,
    getTrending,
    getVotedPolls,
    listPolls,
    getPoll,
    getPollAnalytics,
} from "../controllers/pollController.js";
import {
    votePoll,
    removeVote,
    closePoll,
    updatePoll,
    deletePoll,
    toggleBookmark,
} from "../controllers/voteController.js";
import { upload } from "../config/cloudinary.js";

const pollRouter = express.Router();

pollRouter.use(protect);

pollRouter.get("/", listPolls);
pollRouter.post("/", upload.array("images", 4), createPoll);
pollRouter.get("/mine", getMyPolls);
pollRouter.get("/voted", getVotedPolls);
pollRouter.get("/bookmarks", getBookmarks);
pollRouter.get("/trending", getTrending);

// All :id routes validate ObjectId first
pollRouter.get("/:id/analytics", validateObjectId, getPollAnalytics);
pollRouter.get("/:id", validateObjectId, getPoll);

pollRouter.post("/:id/vote", validateObjectId, votePoll);
pollRouter.delete("/:id/vote", validateObjectId, removeVote);
pollRouter.patch("/:id/close", validateObjectId, closePoll);
pollRouter.patch("/:id", validateObjectId, updatePoll);
pollRouter.delete("/:id", validateObjectId, deletePoll);
pollRouter.post("/:id/bookmark", validateObjectId, toggleBookmark);

export default pollRouter;