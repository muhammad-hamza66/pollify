import mongoose from "mongoose";

/**
 * Validates that req.params.id is a well-formed MongoDB ObjectId.
 * Prevents CastError stack traces from leaking to clients.
 */
export const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }
    next();
};
