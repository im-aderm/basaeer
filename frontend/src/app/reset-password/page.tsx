"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(true);
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const t = searchParams.get("token");
        const id = searchParams.get("id");
        if (!t || !id) {
            setStatus("error");
            setMessage("Invalid or missing password reset token. Please request a new link.");
            setIsValidating(false);
        } else {
            setToken(t);
            setUserId(id);
            setIsValidating(false);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setMessage("Password must be at least 6 characters long.");
            return;
        }

        setStatus("loading");

        try {
            await api.post("/auth/reset-password", { 
                token, 
                id: userId, 
                newPassword: password 
            });
            setStatus("success");
            setMessage("Your password has been successfully reset. You can now sign in with your new password.");
            
            // Redirect after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: unknown) {
            setStatus("error");
            const axiosError = err as { response?: { data?: { message?: string } } };
            setMessage(axiosError.response?.data?.message || "Unable to reset your password. The link might have expired.");
        }
    };

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#F3F4F6]">
                <div className="animate-spin text-[#2563EB]">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" strokeLinecap="round" opacity="0.3"></circle>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" strokeLinecap="round" className="opacity-100" strokeDashoffset="31.4"></circle>
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F3F4F6] transition-colors duration-300">
            <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
                <div className="p-8">
                    {status === "success" ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-xl font-semibold text-[#111827] mb-2">Password Reset Successful</h2>
                            <p className="text-[#6B7280] mb-8">{message}</p>
                            <Link href="/login" className="w-full inline-block py-3 px-4 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold rounded-xl transition-all duration-200">
                                Go to Sign In
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">Create New Password</h1>
                                <p className="text-[#6B7280]">Your new password must be securely formed.</p>
                            </div>

                            {status === "error" && (
                                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium" role="alert">
                                    {message}
                                </div>
                            )}

                            {token && userId ? (
                                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-sm font-medium text-[#111827] ml-1 block">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]" aria-hidden="true">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all duration-200 text-[#111827] placeholder:text-[#9CA3AF]"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-medium text-[#111827] ml-1 block">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]" aria-hidden="true">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all duration-200 text-[#111827] placeholder:text-[#9CA3AF]"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                                    >
                                        {status === "loading" ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Resetting...
                                            </span>
                                        ) : "Reset password"}
                                    </button>
                                </form>
                            ) : (
                                <Link href="/forgot-password" className="w-full inline-block text-center py-3 px-4 bg-[#2563EB] text-white font-semibold rounded-xl">
                                    Request a new link
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
