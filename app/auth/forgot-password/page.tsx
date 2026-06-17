
"use client";

import { useState } from "react";
import { GlassPanel, ExtrudedButton, SunkenInput } from "@/components/immersive";
import { ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
                Reset Your Password
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your email and we'll send you a reset link
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
                    Check Your Email!
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    If an account exists with that email, a password reset link
                    has been sent. For demo purposes, check the server logs for
                    the reset link.
                  </p>
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

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Email Address
                    </label>
                    <SunkenInput
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Submit Button */}
                  <ExtrudedButton
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
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
