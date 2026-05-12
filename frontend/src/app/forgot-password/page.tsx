"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await api.post("/auth/forgot-password", { email });
            setStatus("success");
            setMessage(res.data.message || "If that email address is in our database, we will send you an email to reset your password.");
        } catch (err: unknown) {
            setStatus("error");
            setMessage("Unable to process request. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F3F4F6] transition-colors duration-300">
            <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
                <div className="p-8">
                    <div className="mb-8">
                        <Link href="/login" className="inline-flex items-center text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-6 group">
                            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to login
                        </Link>
                        <h1 className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">Forgot Password</h1>
                        <p className="text-[#6B7280]">Enter your email and we'll send you a reset link.</p>
                    </div>

                    {status === "success" ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                <Mail size={32} />
                            </div>
                            <h2 className="text-xl font-semibold text-[#111827] mb-2">Check your email</h2>
                            <p className="text-[#6B7280] mb-8">{message}</p>
                            <Link href="/login" className="w-full inline-block py-3 px-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] font-semibold rounded-xl transition-all duration-200">
                                Return to sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            {status === "error" && (
                                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium" role="alert">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-[#111827] ml-1 block">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]" aria-hidden="true">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all duration-200 text-[#111827] placeholder:text-[#9CA3AF]"
                                            placeholder="admin@basaer.com"
                                            required
                                            autoComplete="email"
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
                                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status" aria-label="Sending" />
                                            Sending reset link...
                                        </span>
                                    ) : "Send reset link"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
