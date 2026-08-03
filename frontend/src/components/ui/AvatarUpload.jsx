import { useRef, useState, useCallback } from "react";
import { Camera, X, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import clsx from "clsx";

// ─── Constants ────────────────────────────────────────────────────────────────
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_EXT   = /\.(jpe?g|png|webp)$/i;
const MAX_BYTES     = 5 * 1024 * 1024; // 5 MB

// ─── Lightweight client-side image compressor ─────────────────────────────────
// Draws the image onto an off-screen canvas and re-exports as JPEG at 85% quality.
// Skips compression if the file is already under the target size.
async function compressImage(file, targetBytes = 1.5 * 1024 * 1024) {
  if (file.size <= targetBytes) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Scale down so the largest dimension ≤ 1024 px
      const MAX_DIM = 1024;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          const compressed = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ─── Validate a File object ───────────────────────────────────────────────────
function validateFile(file) {
  if (!ALLOWED_TYPES.has(file.type) || !ALLOWED_EXT.test(file.name)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`;
  }
  return null;
}

/**
 * AvatarUpload
 *
 * Props:
 *   onChange(file | null) — called with the processed File or null on remove
 *   disabled             — disables all interaction
 *   name                 — used for the gradient initials fallback while no image is selected
 */
export default function AvatarUpload({ onChange, disabled = false, name = "" }) {
  const inputRef  = useRef(null);
  const [preview, setPreview]   = useState(null);   // object URL
  const [status,  setStatus]    = useState("idle");  // idle | processing | ready | error
  const [error,   setError]     = useState("");
  const [drag,    setDrag]      = useState(false);
  const [progress, setProgress] = useState(0);       // 0-100 fake progress

  // Derive initials for the empty state gradient tile
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

  // ── Core processing pipeline ─────────────────────────────────────────────
  const processFile = useCallback(async (raw) => {
    setError("");
    const validationError = validateFile(raw);
    if (validationError) {
      setError(validationError);
      setStatus("error");
      return;
    }

    setStatus("processing");
    setProgress(10);

    // Verify the file is actually a decodable image (catches corrupted files)
    try {
      await new Promise((res, rej) => {
        const img = new Image();
        const url  = URL.createObjectURL(raw);
        img.onload = () => { URL.revokeObjectURL(url); res(); };
        img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Corrupted image")); };
        img.src = url;
      });
    } catch {
      setError("This image appears to be corrupted or unreadable.");
      setStatus("error");
      return;
    }

    setProgress(40);

    // Compress if necessary
    let processed = raw;
    try {
      processed = await compressImage(raw);
    } catch {
      // Compression failed — proceed with original
    }

    setProgress(90);

    // Build a new preview URL from the (possibly compressed) file
    if (preview) URL.revokeObjectURL(preview);
    const newPreview = URL.createObjectURL(processed);
    setPreview(newPreview);
    setProgress(100);
    setStatus("ready");
    onChange?.(processed);
  }, [preview, onChange]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so picking the same file again fires the event
    e.target.value = "";
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setStatus("idle");
    setError("");
    setProgress(0);
    onChange?.(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setDrag(true); };
  const handleDragLeave = () => setDrag(false);

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const isProcessing = status === "processing";

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* ── Avatar button ── */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => !disabled && !isProcessing && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={handleKeyDown}
          disabled={disabled || isProcessing}
          aria-label="Upload profile photo"
          className={clsx(
            // Base circle
            "relative h-[100px] w-[100px] rounded-full overflow-hidden",
            "transition-all duration-200 outline-none",
            // Ring states
            "ring-4",
            drag
              ? "ring-primary-500 scale-105 shadow-lg shadow-primary-500/25"
              : status === "ready"
              ? "ring-primary-500/60"
              : status === "error"
              ? "ring-red-400/60"
              : "ring-gray-200 dark:ring-gray-700",
            // Hover glow
            !disabled && !isProcessing && "cursor-pointer hover:ring-primary-400 hover:shadow-lg hover:shadow-primary-500/20 hover:scale-[1.02]",
            // Focus ring (from global CSS)
            "focus-visible:ring-primary-500"
          )}
        >
          {/* ── Background: preview OR gradient initials placeholder ── */}
          {preview ? (
            <img
              src={preview}
              alt="Profile photo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white tracking-wide">{initials}</span>
            </div>
          )}

          {/* ── Processing overlay ── */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
              <span className="text-[10px] text-white/80 font-medium">{progress}%</span>
            </div>
          )}

          {/* ── Idle / hover camera overlay ── */}
          {!isProcessing && (
            <div
              className={clsx(
                "absolute inset-0 flex flex-col items-center justify-center gap-1",
                "transition-opacity duration-150",
                preview
                  ? "bg-black/40 opacity-0 group-hover:opacity-100"
                  : "bg-black/20 opacity-100"
              )}
            >
              <Camera className="h-6 w-6 text-white drop-shadow" />
              {!preview && (
                <span className="text-[10px] text-white/90 font-semibold tracking-wide">PHOTO</span>
              )}
            </div>
          )}
        </button>

        {/* ── Success badge ── */}
        {status === "ready" && (
          <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-green-500 border-2 border-white dark:border-surface-dark flex items-center justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </span>
        )}

        {/* ── Remove button ── */}
        {status === "ready" && !isProcessing && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove profile photo"
            className={clsx(
              "absolute -top-1 -right-1 h-6 w-6 rounded-full",
              "bg-gray-800 dark:bg-gray-700 border-2 border-white dark:border-surface-dark",
              "text-white flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
              "hover:bg-red-500 focus-visible:opacity-100"
            )}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Label / CTA text ── */}
      <div className="text-center">
        {status === "ready" ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => !disabled && inputRef.current?.click()}
              className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline focus-visible:underline outline-none"
            >
              Change photo
            </button>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors outline-none focus-visible:text-red-500"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Upload className="h-3 w-3 shrink-0" />
            <span>Click or drag to upload</span>
          </div>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
          JPG, PNG, WebP · max 5 MB
        </p>
      </div>

      {/* ── Progress bar ── */}
      {isProcessing && (
        <div className="w-[100px] h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ── Validation error ── */}
      {error && (
        <div className="flex items-start gap-1.5 max-w-[220px] bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">{error}</p>
        </div>
      )}

      {/* ── Hidden file input ── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
