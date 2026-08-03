import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Upload security constants ──────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ─── Multer instance with strict validation ─────────────────────────────────
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 4, // never accept more than 4 files in a single request
    },
    fileFilter: (_req, file, cb) => {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
        }
        // Validate file extension (defence-in-depth against MIME spoofing)
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return cb(new Error("Invalid file extension."));
        }
        cb(null, true);
    },
});

// ─── Upload helper ──────────────────────────────────────────────────────────
export const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "polling-app", resource_type: "image" },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(buffer);
    });

export default cloudinary;