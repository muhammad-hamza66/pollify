import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound, ArrowLeft } from "lucide-react";
import { authApi } from "../../api/auth";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

// One page, three steps: request OTP -> verify OTP -> set new password.
// Matches passwordController.js exactly: forgot-password, verify-reset-otp, reset-password.
export default function ForgotPasswordPage() {
  const [step, setStep] = useState("email"); // email | otp | password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success("Code sent to your email");
      setStep("otp");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.verifyResetOtp({ email, otp });
      setStep("password");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, password });
      toast.success("Password reset. Please log in.");
      navigate("/login");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4">
        <ArrowLeft className="h-3 w-3" /> Back to login
      </Link>

      <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center mb-4">
        <KeyRound className="h-6 w-6 text-primary-600" />
      </div>

      {step === "email" && (
        <>
          <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email and we'll send a reset code.</p>
          <form onSubmit={requestOtp} className="space-y-4">
            <FormField label="Email" htmlFor="email">
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </FormField>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              Send reset code
            </Button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className="text-2xl font-bold mb-1">Check your email</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter the 6-digit code sent to {email}.</p>
          <form onSubmit={verifyOtp} className="space-y-4">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-semibold"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" loading={loading} disabled={otp.length !== 6}>
              Verify code
            </Button>
          </form>
        </>
      )}

      {step === "password" && (
        <>
          <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">At least 8 characters.</p>
          <form onSubmit={resetPassword} className="space-y-4">
            <FormField label="New password" htmlFor="password">
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormField>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              Reset password
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
