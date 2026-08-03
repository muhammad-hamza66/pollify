import express from "express";
import { protect } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { addComment, deleteComment, getComments } from "../controllers/commentController.js";

const commentRouter = express.Router();
commentRouter.use(protect);

commentRouter.get("/:pollId", getComments);
commentRouter.post("/:pollId", addComment);
commentRouter.delete("/:id", validateObjectId, deleteComment);

export default commentRouter;