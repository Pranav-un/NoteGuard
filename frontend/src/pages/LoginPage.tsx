import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { toast } from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import type { LoginRequest } from "../types";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    emailOrUsername: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const { isLoadingKey } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Check if login is in progress
  const isLoginLoading = isLoadingKey("login");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.emailOrUsername || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login({
        emailOrUsername: formData.emailOrUsername,
        password: formData.password,
      });
      toast.success("Login successful!");
      navigate(from, { replace: true });
    } catch (err: any) {
      // Error is already handled by the API client and shown as toast
      setError(err.message || "Login failed. Please check your credentials.");
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your NoteGuard account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="error-message">{error}</div>}

          {/* Email or Username Input */}
          <div className="form-group">
            <label htmlFor="emailOrUsername" className="form-label">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="username"
                required
                value={formData.emailOrUsername}
                onChange={handleChange}
                className="form-input pl-9"
                placeholder="Enter your email or username"
                disabled={isLoginLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input pl-9 pr-9"
                placeholder="Enter your password"
                disabled={isLoginLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoginLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoginLoading}
            className="btn btn-primary w-full"
          >
            {isLoginLoading ? <div className="loading-spinner mr-2" /> : null}
            {isLoginLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-5 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-accent-600 hover:text-accent-700 transition-colors duration-200"
            >
              Sign up
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

export default LoginPage;
