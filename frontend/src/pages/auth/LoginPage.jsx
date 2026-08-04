import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (e) {
      if (e.status === 403 && e.raw?.response?.data?.needsVerification) {
        toast("Please verify your email first", { icon: "✉️" });
        navigate("/verify-otp", {
          state: { email: e.raw.response.data.email },
        });
        return;
      }
      setServerError(e.message);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] dark:text-white mb-1.5">
          Welcome back
        </h1>
        <p className="text-sm text-[#64748b] dark:text-gray-400">
          Log in to keep voting and creating polls.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10"
              error={!!errors.email}
              {...register("email", { required: "Email is required" })}
            />
          </div>
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] pointer-events-none" />
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-10 pr-11"
              error={!!errors.password}
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPass ? "Hide password" : "Show password"}
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] dark:hover:text-gray-300 transition-colors"
            >
              {showPass ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3">
            <span className="text-red-500 text-sm mt-0.5">⚠</span>
            <p className="text-sm text-red-600 dark:text-red-400">
              {serverError}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
        >
          Log in
        </Button>
      </form>

      <p className="text-sm text-center text-[#64748b] dark:text-gray-400 mt-6">
        New to Pollify?{" "}
        <Link
          to="/register"
          className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
