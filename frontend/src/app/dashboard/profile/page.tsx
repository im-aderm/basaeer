"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Save, Loader2, Mail, Phone } from "lucide-react";
import { useNotification } from '@/context/NotificationContext';
import api from "@/lib/api";
import MotionWrapper from "@/components/ui/MotionWrapper";

export default function ProfilePage() {
  const { showSuccess, showError } = useNotification();
  const { user, resolvedBranchId } = useAuth();
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPw: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/auth/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      showSuccess("Profile updated successfully");
    } catch (err: any) {
      showError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPw !== passwordData.confirm) {
      showError("New passwords do not match");
      return;
    }
    if (passwordData.newPw.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }
    setChangingPw(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.newPw,
      });
      showSuccess("Password changed successfully");
      setPasswordData({ current: "", newPw: "", confirm: "" });
    } catch (err: any) {
      showError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <MotionWrapper>
        <div>
          <h1 className="text-h1 font-bold tracking-tight text-primary">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account details and security settings.</p>
        </div>
      </MotionWrapper>

      {/* Edit Profile */}
      <MotionWrapper delay={0.1}>
        <div className="bg-white/75 border border-border/50 rounded-[2.5rem] p-8 md:p-10 card-hover shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-h2 font-bold tracking-tight text-primary">Edit Profile</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="pl-10 opacity-60"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+234 ..."
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="btn-press">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
            </Button>
          </form>
        </div>
      </MotionWrapper>

      {/* Change Password */}
      <MotionWrapper delay={0.2}>
        <div className="bg-white/75 border border-border/50 rounded-[2.5rem] p-8 md:p-10 card-hover shadow-xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-h2 font-bold tracking-tight text-primary">Change Password</h2>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPw" className="text-sm font-semibold">Current Password</Label>
              <Input
                id="currentPw"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newPw" className="text-sm font-semibold">New Password</Label>
                <Input
                  id="newPw"
                  type="password"
                  value={passwordData.newPw}
                  onChange={(e) => setPasswordData({ ...passwordData, newPw: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPw" className="text-sm font-semibold">Confirm Password</Label>
                <Input
                  id="confirmPw"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" disabled={changingPw} className="btn-press">
              {changingPw ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : <><Lock size={18} /> Update Password</>}
            </Button>
          </form>
        </div>
      </MotionWrapper>
    </div>
  );
}
