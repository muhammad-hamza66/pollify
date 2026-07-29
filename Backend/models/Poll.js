import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true,
    _id: false
});

const pollSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["single", "yesno", "rating", "image", "open"],
        required: true,
    },
    options: [{
        text: String,
        image: String
    }],
    category: {
        type: String,
        default: "General",
        trim: true
    },
    closed: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    votes: [voteSchema],
}, {
    timestamps: true
});

export const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
