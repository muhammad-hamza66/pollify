import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X, Plus, Upload, Sparkles } from "lucide-react";
import clsx from "clsx";
import { pollsApi } from "../api/polls";
import { POLL_TYPES } from "../utils/pollMeta";
import Input from "../components/ui/Input";
import FormField from "../components/ui/FormField";
import Button from "../components/ui/Button";

const CATEGORIES = [
  "General",
  "Technology",
  "Sports",
  "Entertainment",
  "Politics",
  "Lifestyle",
  "Gaming",
  "Food",
];

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("single");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("General");
  const [options, setOptions] = useState(["", ""]);
  const [images, setImages] = useState([]); // File[]
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const updateOption = (i, val) =>
    setOptions((opts) => opts.map((o, idx) => (idx === i ? val : o)));
  const addOption = () => options.length < 8 && setOptions((o) => [...o, ""]);
  const removeOption = (i) =>
    options.length > 2 && setOptions((o) => o.filter((_, idx) => idx !== i));

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - images.length);
    setImages((prev) => [...prev, ...files].slice(0, 4));
  };
  const removeImage = (i) =>
    setImages((imgs) => imgs.filter((_, idx) => idx !== i));

  const validate = () => {
    if (!question.trim()) return "Question is required";
    if (type === "single") {
      const filled = options.filter((o) => o.trim());
      if (filled.length < 2) return "Add at least 2 options";
    }
    if (type === "image" && images.length < 2) return "Add at least 2 images";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError("");
    setSubmitting(true);
    try {
      const data = await pollsApi.create({
        question: question.trim(),
        type,
        category,
        options:
          type === "single" ? options.filter((o) => o.trim()) : undefined,
        images: type === "image" ? images : undefined,
      });
      toast.success("Poll created!");
      navigate(`/polls/${data.poll._id}`);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-1 text-[#0f172a] dark:text-white">
        <Sparkles className="h-5 w-5 text-primary-600" /> Create a poll
      </h1>
      <p className="text-sm text-[#64748b] dark:text-gray-400 mb-6">
        Pick a format, ask your question, and publish.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <FormField label="Poll type">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POLL_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={clsx(
                    "text-left p-3.5 rounded-xl border-2 transition-all duration-150",
                    type === t.value
                      ? "border-primary-500 bg-primary-50/60 dark:bg-primary-500/10 shadow-sm shadow-primary-500/10"
                      : "border-[#e2e8f0] dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-4 w-4 mb-1.5",
                      type === t.value
                        ? "text-primary-600"
                        : "text-[#94a3b8]"
                    )}
                  />
                  <p className="text-sm font-semibold text-[#0f172a] dark:text-gray-100">
                    {t.label}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5 leading-snug">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Question" htmlFor="question">
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              type === "open"
                ? "What should we build next?"
                : "What's your favorite…"
            }
            maxLength={280}
          />
        </FormField>

        <FormField label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>

        {type === "single" && (
          <FormField label="Options">
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    maxLength={80}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="p-2.5 text-[#94a3b8] hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      aria-label="Remove option"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 8 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add option
                </button>
              )}
            </div>
          </FormField>
        )}

        {type === "yesno" && (
          <p className="text-sm text-[#64748b] bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3 border border-[#e2e8f0] dark:border-gray-700">
            Voters will choose between{" "}
            <span className="font-medium text-[#0f172a] dark:text-gray-200">
              Yes
            </span>{" "}
            and{" "}
            <span className="font-medium text-[#0f172a] dark:text-gray-200">
              No
            </span>{" "}
            — no extra setup needed.
          </p>
        )}

        {type === "rating" && (
          <p className="text-sm text-[#64748b] bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3 border border-[#e2e8f0] dark:border-gray-700">
            Voters will rate this from 1 to 5 stars — no extra setup needed.
          </p>
        )}

        {type === "open" && (
          <p className="text-sm text-[#64748b] bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3 border border-[#e2e8f0] dark:border-gray-700">
            Voters will submit free-text answers instead of picking an option.
          </p>
        )}

        {type === "image" && (
          <FormField label="Images (2-4)">
            <div className="grid grid-cols-4 gap-2 mb-2">
              {images.map((file, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden group"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-[#94a3b8] hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  <Upload className="h-5 w-5 mb-1" />
                  <span className="text-[10px]">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onPickImages}
            />
          </FormField>
        )}

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={submitting} className="flex-1">
            Publish poll
          </Button>
        </div>
      </form>
    </div>
  );
}
