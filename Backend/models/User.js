import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        avatar: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            default: "",
            maxlength: 160
        },
        bookmarks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Poll"
        }],
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        isVerified: {
            type: Boolean,
            default: false
        },
        otp: String,
        otpExpires: Date
    }, {
    timestamps: true
}
);

// to hash the password before saving the user document
// NOTE: mongoose 9's hook engine (kareem) no longer passes a `next`
// callback to async pre-hooks -- it just awaits the returned promise.
// Do not add a `next` parameter here; simply return/await instead.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// to compare the entered password with the hashed password in the database
userSchema.methods.comparePassword = async function (plain) {
    return await bcrypt.compare(plain, this.password);
};

// alias for matchPassword
userSchema.methods.matchPassword = async function (plain) {
    return await this.comparePassword(plain);
};

export const User = mongoose.model("User", userSchema);
export default User;