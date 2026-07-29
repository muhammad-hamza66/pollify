import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (e) {
      if (e.status === 403 && e.raw?.response?.data?.needsVerification) {
        toast("Please verify your email first", { icon: "✉️" });
        navigate("/verify-otp", { state: { email: e.raw.response.data.email } });
        return;
      }
      setServerError(e.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Log in to keep voting and creating polls.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: "Email is required" })} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="••••••••" {...register("password", { required: "Password is required" })} />
        </FormField>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
        New to Pollify?{" "}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
