import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, AtSign, Lock, User, Mail } from "lucide-react";
import { authApi } from "../../api/auth";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import AvatarUpload from "../../components/ui/AvatarUpload";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [imageFile, setImageFile]     = useState(null);
  const [showPass,  setShowPass]      = useState(false);

  // Live password strength
  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const data = await authApi.register({ ...values, image: imageFile ?? undefined });
      toast.success("Check your email for a verification code! 📬");
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <div className="animate-fade-up">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Join Pollify and start creating polls in seconds.
        </p>
      </div>

      {/* ── Avatar upload ───────────────────────────────────────────────── */}
      <div className="flex justify-center mb-7">
        <AvatarUpload
          name={watch("name") || ""}
          onChange={setImageFile}
          disabled={isSubmitting}
        />
      </div>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Full name */}
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="name"
              placeholder="Jane Doe"
              className="pl-10"
              error={!!errors.name}
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "At least 2 characters" } })}
            />
          </div>
        </FormField>

        {/* Username */}
        <FormField label="Username" htmlFor="username" error={errors.username?.message}>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="username"
              placeholder="janedoe"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="pl-10"
              error={!!errors.username}
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "At least 3 characters" },
                maxLength: { value: 30, message: "Max 30 characters" },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Only letters, numbers, and underscores",
                },
              })}
            />
          </div>
        </FormField>

        {/* Email */}
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10"
              error={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
          </div>
        </FormField>

        {/* Password */}
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              className="pl-10 pr-11"
              error={!!errors.password}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
                validate: {
                  hasUpper: (v) => /[A-Z]/.test(v) || "Include at least one uppercase letter",
                  hasNumber: (v) => /[0-9]/.test(v) || "Include at least one number",
                },
              })}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPass ? "Hide password" : "Show password"}
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < strength.score
                        ? strength.color
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] font-medium ${strength.textColor}`}>
                {strength.label}
              </p>
            </div>
          )}
        </FormField>

        {/* Server error */}
        {serverError && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3">
            <span className="text-red-500 text-sm mt-0.5">⚠</span>
            <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full mt-1"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {/* ── Footer link ─────────────────────────────────────────────────── */}
      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

// ─── Password strength helper ─────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "", textColor: "" };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 1, label: "Weak",      color: "bg-red-400",    textColor: "text-red-500 dark:text-red-400" },
    { score: 2, label: "Fair",      color: "bg-orange-400", textColor: "text-orange-500 dark:text-orange-400" },
    { score: 3, label: "Good",      color: "bg-yellow-400", textColor: "text-yellow-600 dark:text-yellow-400" },
    { score: 4, label: "Strong 💪", color: "bg-green-500",  textColor: "text-green-600 dark:text-green-400" },
  ];

  return levels[Math.min(score, levels.length) - 1] || levels[0];
}
