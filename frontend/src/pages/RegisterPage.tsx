import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { toast } from "react-hot-toast";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import type { RegisterRequest } from "../types";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const { isLoadingKey } = useLoading();
  const navigate = useNavigate();

  // Check if registration is in progress
  const isRegisterLoading = isLoadingKey("register");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success("Registration successful! Welcome to NoteGuard!");
      navigate("/dashboard");
    } catch (err: any) {
      // Error is already handled by the API client and shown as toast
      if (err.message) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="app-page auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 mb-4">
            <img src="/logo.svg" alt="NoteGuard Logo" className="h-5 w-auto" />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Join NoteGuard and secure your thoughts
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={`form-input pl-9 ${
                  errors.username
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : ""
                }`}
                placeholder="Choose a username"
                disabled={isRegisterLoading}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`form-input pl-10 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Enter your email"
                disabled={isRegisterLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`form-input pl-10 pr-10 ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Create a password"
                disabled={isRegisterLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                disabled={isRegisterLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={handleChange}
                className={`form-input pl-10 pr-10 ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder="Confirm your password"
                disabled={isRegisterLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                disabled={isRegisterLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isRegisterLoading}
            className="btn btn-primary w-full"
          >
            {isRegisterLoading ? (
              <div className="loading-spinner mr-2" />
            ) : null}
            {isRegisterLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-5 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent-600 hover:text-accent-700 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            © 2024 NoteGuard. Secure your thoughts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
