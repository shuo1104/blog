"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Lock, User, KeyRound, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { login, isAuthenticated } from "../../services/auth-store";
import { ThemeToggle } from "../../components/theme-toggle";

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to admin
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const ok = login(username, password);
      if (ok) {
        navigate("/admin");
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-6 py-12 text-foreground antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Top Bar with Back Link & Theme Toggle */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/95 p-8 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/95">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200/60 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 shadow-inner">
              <Lock className="size-6 text-foreground" />
            </div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Author Portal
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Sign in to manage, write and publish blog essays
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoFocus
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-850/50 dark:focus:border-neutral-400 dark:focus:bg-neutral-900 dark:focus:ring-white/10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-850/50 dark:focus:border-neutral-400 dark:focus:bg-neutral-900 dark:focus:ring-white/10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Enter Studio</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Helper credentials pill */}
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border/40 bg-neutral-50/60 p-2.5 text-[11px] text-muted-foreground dark:bg-neutral-850/40">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Default demo: <code className="font-mono font-bold text-foreground">admin</code> / <code className="font-mono font-bold text-foreground">admin888</code></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;
