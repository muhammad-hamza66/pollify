import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MailCheck } from "lucide-react";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeVerification } = useAuth();
  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  if (!email) {
    return (
      <div className="text-center animate-fade-up">
        <p className="text-sm text-[#64748b]">
          No email found for verification. Please{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-primary-600 hover:underline font-medium"
          >
            register
          </button>{" "}
          first.
        </p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await completeVerification({ email, otp });
      toast.success("Welcome to Pollify!");
      navigate("/dashboard");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(email);
      toast.success("A new code was sent to your email");
    } catch (e2) {
      toast.error(e2.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center mb-5">
        <MailCheck className="h-6 w-6 text-primary-600" />
      </div>
      <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-1.5">
        Verify your email
      </h1>
      <p className="text-sm text-[#64748b] dark:text-gray-400 mb-6">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-[#0f172a] dark:text-gray-200">
          {email}
        </span>
      </p>

      <form onSubmit={submit} className="space-y-4">
        <Input
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          className="text-center text-2xl tracking-[0.4em] font-semibold"
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
          disabled={otp.length !== 6}
        >
          Verify & continue
        </Button>
      </form>

      <p className="text-sm text-center text-[#64748b] dark:text-gray-400 mt-6">
        Didn't get a code?{" "}
        <button
          onClick={resend}
          disabled={resending}
          className="text-primary-600 dark:text-primary-400 font-medium hover:underline disabled:opacity-50"
        >
          Resend
        </button>
      </p>
    </div>
  );
}
