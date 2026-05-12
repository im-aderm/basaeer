"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, Fingerprint } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      // login() is now async — await it to ensure profile is fetched before navigation
      // pass both user and access_token
      await login(res.data.user, res.data.access_token);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (axiosError.response?.status === 400) {
        setError("Please enter a valid email and password.");
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background twilight image & aurora glows */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10"></div>
        <img 
          className="w-full h-full object-cover" 
          alt="Cinematic school twilight backdrop" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvoR0tmlz67Z2nvt4-2_Vsl_OwrnaGmo1GYXvK4tARbgO_BwEH_JTU7YBUe8-YAyQtRLb1HQXtGz9cHvTEwKrb0p3g2sRrcs1hR8isBDGR4fH7A_W0DOJUj3oVq-7ojQoq-oV2Mr6PvY2BTEJeY925CDbiV3HneJbbj1BNUC4eqLe9bdGVKKm59_nrMmHCgZ08mhkwflUZztwkAuC47c4ehaUfoGZVsqRy44WjKsf1J3hJR9Cltun2zUOynf67ku26-5Faw2wkjYg" 
        />
      </div>

      <GradientBackground />

      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center w-full space-y-12">
        <div className="space-y-4">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold tracking-widest uppercase">
            Elite Parent Portal
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary font-heading leading-tight">
            Your Child's Progress, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">Illuminated.</span>
          </h1>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Access real-time academic insights, secure administrative controls, and spiritual growth tracking in a single, unified sanctuary for Basaer families.
          </p>
        </div>

        {/* Secure Login Card */}
        <div className="max-w-md mx-auto glass-card p-8 md:p-10 rounded-[32px] shadow-2xl relative border border-border/40 hover:border-primary-light/30 transition-all duration-500">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs md:text-sm font-medium" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="text-left space-y-2">
              <label htmlFor="email" className="text-[10px] font-bold text-text-secondary tracking-wider uppercase ml-2 block">
                Parent ID / Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/60" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container/30 border border-border rounded-xl py-3 pl-12 pr-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-text-primary placeholder-text-secondary/30 text-sm"
                  placeholder="e.g. PAR-2024-001 or admin@basaer.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="text-left space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label htmlFor="password" className="text-[10px] font-bold text-text-secondary tracking-wider uppercase block">
                  Secure Passcode
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-primary-light hover:underline">
                  Forgot Access?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-light/60" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container/30 border border-border rounded-xl py-3 pl-12 pr-12 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-text-primary placeholder-text-secondary/30 text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status" aria-label="Signing in" />
                  Signing in...
                </span>
              ) : (
                <>
                  ENTER PORTAL
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 pt-2 text-text-secondary/40 border-t border-border">
              <Fingerprint size={24} className="text-primary-light/40" />
              <p className="text-xs italic text-text-secondary opacity-60">Biometric Secure Entry Available</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
