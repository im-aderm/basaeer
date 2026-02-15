"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });
            login(res.data.access_token, res.data.user);
        } catch (err: any) {
            console.error(err);
            setError("Invalid credentials. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F3F4F6] transition-colors duration-300">
            <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-[#6B7280]">Sign in to your Basaeer account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#111827] ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all duration-200 text-[#111827] placeholder:text-[#9CA3AF]"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-[#111827]">Password</label>
                                <Link href="#" className="text-xs font-medium text-[#2563EB] hover:text-[#2563EB]/80 transition-colors">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] transition-all duration-200 text-[#111827] placeholder:text-[#9CA3AF]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-[#6B7280]">
                        {"Don't have an account? "}
                        <Link href="#" className="font-medium text-[#2563EB] hover:text-[#2563EB]/80 transition-colors" onClick={(e) => e.preventDefault()}>
                            Contact Admin
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
