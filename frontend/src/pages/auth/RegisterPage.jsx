import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/auth";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const data = await authApi.register(values);
      toast.success("Check your email for a verification code");
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Join Pollify and start creating polls in seconds.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Jane Doe" {...register("name", { required: "Name is required" })} />
        </FormField>

        <FormField label="Username" htmlFor="username" error={errors.username?.message}>
          <Input
            id="username"
            placeholder="janedoe"
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "At least 3 characters" },
              pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers, underscores only" },
            })}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters">
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
        </FormField>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
