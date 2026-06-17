
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GlassPanel, ExtrudedButton, SunkenInput } from "@/components/immersive";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <main className="min-h-screen bg-background text-foreground relative py-12 px-4 z-10 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <GlassPanel
            material="glass"
            className="border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden rounded-3xl p-8 text-center"
            tilt={false}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The password reset link is invalid or missing. Please request a
              new one.
            </p>
            <Link href="/auth/forgot-password">
              <ExtrudedButton>Request New Link</ExtrudedButton>
            </Link>
          </GlassPanel>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative py-12 px-4 z-10 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassPanel
            material="glass"
            className="border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden rounded-3xl"
            tilt={false}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500/10 via-violet-500/5 to-transparent border-b border-slate-200 dark:border-white/5 px-8 py-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
                Set New Password
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your new password below
              </p>
            </div>

            <div className="px-8 pb-8 pt-6">
              {/* Success Message */}
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Password Reset!
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Your password has been successfully reset. You can now log
                    in with your new password.
                  </p>
                  <Link href="/">
                    <ExtrudedButton>Go to Login</ExtrudedButton>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-xl border border-red-300 dark:border-red-500/20 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-semibold">{error}</span>
                    </div>
                  )}

                  {/* New Password Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      New Password
                    </label>
                    <div className="relative">
                      <SunkenInput
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <SunkenInput
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <ExtrudedButton
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </ExtrudedButton>
                </form>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </main>
  );
}
