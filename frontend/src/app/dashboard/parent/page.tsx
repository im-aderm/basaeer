"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  Wallet,
  GraduationCap,
  ChevronRight,
  MessageCircle,
  Bell,
  TrendingUp,
  School,
  BookOpen,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { StakeholderService } from "@/services/stakeholderService";
import { useNotification } from '@/context/NotificationContext';
import Link from "next/link";

export default function ParentDashboardPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showError } = useNotification();
  const [children, setChildren] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [childrenData, eventsData] = await Promise.all([
          StakeholderService.getChildren(),
          StakeholderService.getParentEvents(),
        ]);
        setChildren(childrenData);
        setEvents(eventsData);
      } catch (error) {
        showError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateAttendance = (attendance: any[]) => {
    if (!attendance || attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "PRESENT").length;
    return Math.round((present / attendance.length) * 100);
  };

  const getFeeStatus = (invoices: any[]) => {
    if (!invoices || invoices.length === 0) return { label: "N/A", color: "text-[#ccc3d8]/60" };
    const hasUnpaid = invoices.some((inv) => inv.status !== "PAID");
    return hasUnpaid
      ? { label: "Pending: Q2 Fees", color: "text-red-400" }
      : { label: "Fully Paid", color: "text-emerald-400" };
  };

  const getPerformance = (results: any[]) => {
    if (!results || results.length === 0) return "A";
    const latest = results[0];
    return latest.finalGrade || `${latest.average?.toFixed(0)}%` || "A";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-bold text-[#d2bbff] animate-pulse uppercase tracking-widest text-sm">
        Loading Family Data Sanctuary...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-h1 font-bold tracking-tight text-white">
            Family Portal Ecosystem
          </h1>
          <p className="text-[#ccc3d8] font-medium mt-1">
            Welcome back, <span className="text-[#d2bbff] font-bold">{user?.firstName}</span>. Your children's academic and spiritual sanctuary.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/parent/communication">
            <Button className="h-12 px-6 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#d2bbff] font-bold hover:bg-[#7c3aed]/20 gap-2">
              <MessageCircle size={18} />
              Quick Chat
            </Button>
          </Link>
        </div>
      </div>

      {(children ?? []).map((child) => {
        const attendancePercent = calculateAttendance(child.attendance) || 98;
        const feeStatus = getFeeStatus(child.invoices);
        const performance = getPerformance(child.resultSummaries);

        return (
          <div key={child.id} className="space-y-8">
            {/* Child Profile Card Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 md:p-8 bg-white/5 border border-white/10 rounded-3xl gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-[#7c3aed]/20">
                  {child.firstName[0]}{child.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white font-heading">
                    {child.firstName} {child.lastName}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-[#7c3aed]/20 text-[#d2bbff] hover:bg-[#7c3aed]/20 border-none rounded-lg text-xs font-bold px-2.5 py-0.5">
                      {child.class?.name || "Grade 4"}
                    </Badge>
                    <Badge className="bg-white/5 text-[#ccc3d8] border-none rounded-lg text-xs font-bold px-2.5 py-0.5">
                      Sec: {child.section?.name || "A"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Link href={`/dashboard/parent/student/${child.id}`}>
                <Button className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 font-bold px-5 py-2.5 flex items-center gap-2 group text-sm">
                  View Full Profile
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Bento Grid Features */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Academic Mastery (Large Card) */}
              <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group cursor-pointer hover:border-[#7c3aed]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-500">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-3xl group-hover:bg-[#7c3aed]/20 transition-all"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#d2bbff] mb-6">
                    <School size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-heading mb-2">Academic Mastery</h3>
                  <p className="text-[#ccc3d8] text-sm max-w-sm mb-8">Real-time grades, teacher feedback, and AI-driven performance trends for every subject.</p>
                </div>
                <div className="relative z-10 flex gap-4 overflow-x-auto pb-2">
                  <div className="min-w-[120px] p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-xs text-[#ccc3d8] mb-1">Mathematics</p>
                    <p className="text-2xl font-bold text-[#d2bbff]">{performance || "A+"}</p>
                  </div>
                  <div className="min-w-[120px] p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-xs text-[#ccc3d8] mb-1">Science</p>
                    <p className="text-2xl font-bold text-[#adc6ff]">94%</p>
                  </div>
                  <div className="min-w-[120px] p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-xs text-[#ccc3d8] mb-1">Arabic</p>
                    <p className="text-2xl font-bold text-[#d2bbff]">A</p>
                  </div>
                </div>
              </div>

              {/* Fee Management (Smart Finance) */}
              <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-[#7c3aed]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-500">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#adc6ff]/10 flex items-center justify-center text-[#adc6ff] mb-6">
                    <Wallet size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-heading mb-2">Smart Finance</h3>
                  <p className="text-[#ccc3d8] text-sm">Secure fee payments, history, and automated scholarship tracking with one-tap clearing.</p>
                </div>
                <div className="mt-8 p-3 rounded-xl bg-[#adc6ff]/10 border border-[#adc6ff]/20 flex items-center justify-between">
                  <span className="text-xs md:text-sm font-bold text-white">{feeStatus.label}</span>
                  <span className="text-xs md:text-sm text-[#adc6ff] font-bold group-hover:underline">Pay Now</span>
                </div>
              </div>

              {/* Attendance Card */}
              <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] transition-all duration-500">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-heading mb-2">Attendance</h3>
                  <p className="text-[#ccc3d8] text-sm">Daily check-in logs and leave management with instant SMS notifications.</p>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <div className="h-2 flex-1 rounded-full bg-red-500/10 overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${attendancePercent}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-red-400">{attendancePercent}%</span>
                </div>
              </div>

              {/* Tahfeez Tracker Card (Large Card) */}
              <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-8 group cursor-pointer hover:border-[#7c3aed]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-500">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#d2bbff]">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white font-heading mb-2">Tahfeez Tracker</h3>
                    <p className="text-[#ccc3d8] text-sm">Monitor Hifz progress, Tajweed quality, and daily revision streaks for the Holy Quran.</p>
                  </div>
                </div>
                <div className="shrink-0 relative w-40 h-40 flex items-center justify-center self-center sm:self-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-white/5" cx="80" cy="80" fill="transparent" r="64" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className="text-[#7c3aed]" cx="80" cy="80" fill="transparent" r="64" stroke="currentColor" strokeDasharray="402" strokeDashoffset="120" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white font-heading">12</span>
                    <span className="text-[10px] text-[#ccc3d8] uppercase tracking-wider font-bold">Juz' Memorized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Latest Updates / Feed Section (Principal alerts & updates) */}
      <section className="pt-8 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Parent Alerts sticky panel */}
          <div className="lg:col-span-4 space-y-6 sticky top-32">
            <h2 className="text-3xl font-bold text-white font-heading">Parent Alerts</h2>
            <p className="text-[#ccc3d8] text-sm">Stay informed with direct broadcasts from the Principal's office and class teachers.</p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-5 bg-white/5 border border-[#7c3aed]/20 rounded-2xl">
                <Bell className="text-[#d2bbff] shrink-0" size={24} />
                <div>
                  <p className="text-sm font-bold text-white">New Policy Update</p>
                  <p className="text-xs text-[#ccc3d8]">Uniform guidelines for Winter term.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl opacity-60">
                <Calendar className="text-[#adc6ff] shrink-0" size={24} />
                <div>
                  <p className="text-sm font-bold text-white">PTM Scheduled</p>
                  <p className="text-xs text-[#ccc3d8]">Next Saturday, 9:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Featured Announcements */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6 relative overflow-hidden group">
              <img 
                className="w-full h-64 object-cover rounded-2xl mb-4 grayscale group-hover:grayscale-0 duration-700 transition-all" 
                alt="Auditorium parent symposium" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKquT3Rogz31nC4tKk_umNbRkvOclC2A4TaRkqBEdp1G2wBWf8r3Wre9aHLuZIpCJIIv0RyMtKk8GxgZAC9lfky7iL-fmmdFMRYXDyQbQU2OFGACRt-29b9iVSjWekfE09aSJ676Uq8R7W8LsNJ2vFj9e3fOB3wODX3-h8af3pvfoXK85u3YQkyLRs_ZaJDKIocWxkMz7JJtPbC_WWx1_TPda8TyMxgTsLkKGnMuX_d8GotcuNuAIX3hdkEkdvPJW0sTl1wg28W3c" 
              />
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#d2bbff] uppercase tracking-wider">Featured Announcement</span>
                <span className="text-[#ccc3d8] opacity-60">2 hours ago</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white font-heading leading-snug">Annual Vision Meet 2024: Shaping Future Leaders Together</h3>
              <p className="text-[#ccc3d8] text-sm md:text-base leading-relaxed">
                We invite all parents to our annual symposium where we unveil the technological roadmap for the upcoming academic year. Learn about our new AI integration in the Tahfeez program and science labs.
              </p>
              <button className="text-[#d2bbff] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Read More <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <span className="p-2 bg-[#adc6ff]/10 rounded-lg text-[#adc6ff]"><Bell size={18} /></span>
                  <span className="text-xs text-[#ccc3d8] opacity-60">Oct 24</span>
                </div>
                <h4 className="font-bold text-white">Inter-Campus Sports Week</h4>
                <p className="text-sm text-[#ccc3d8] leading-relaxed">Details on student participation and logistics for the upcoming athletic championships.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <span className="p-2 bg-[#d2bbff]/10 rounded-lg text-[#d2bbff]"><Users size={18} /></span>
                  <span className="text-xs text-[#ccc3d8] opacity-60">Oct 22</span>
                </div>
                <h4 className="font-bold text-white">Student of the Month</h4>
                <p className="text-sm text-[#ccc3d8] leading-relaxed">Recognizing the exceptional efforts of our Tahfeez students this month.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
