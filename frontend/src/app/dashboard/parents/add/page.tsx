'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    UserPlus,
    ChevronLeft,
    Mail,
    Lock,
    User,
    Phone,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { UserService } from '@/services/userService';
import { toast } from 'sonner';

export default function AddParentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'PARENT'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const newUser = await UserService.create(formData);
            toast.success('Parent created successfully');
            router.push(`/dashboard/parents/${newUser.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create parent');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col gap-2">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="w-fit gap-2 font-semibold uppercase text-xs p-0 hover:bg-transparent hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to Parents
                </Button>
                <h1 className="text-h1 font-semibold tracking-tight uppercase flex items-center gap-4">
                    <UserPlus className="text-primary w-10 h-10" />
                    Register Parent
                </h1>
                <p className="text-muted-foreground text-lg font-medium">Create a new family portal account.</p>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl bg-card overflow-hidden border-t-8 border-t-primary">
                <CardHeader className="p-10 pb-0">
                    <CardTitle className="text-h3 font-semibold uppercase">Account Details</CardTitle>
                    <CardDescription className="font-bold">Enter the primary contact information for the family.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase opacity-50 px-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                    <Input
                                        required
                                        placeholder="e.g. John"
                                        className="h-14 pl-12 rounded-2xl border-border/50 font-bold text-lg focus-visible:ring-primary"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase opacity-50 px-2">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                    <Input
                                        required
                                        placeholder="e.g. Doe"
                                        className="h-14 pl-12 rounded-2xl border-border/50 font-bold text-lg focus-visible:ring-primary"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase opacity-50 px-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                <Input
                                    required
                                    type="email"
                                    placeholder="parent@example.com"
                                    className="h-14 pl-12 rounded-2xl border-border/50 font-bold text-lg focus-visible:ring-primary"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase opacity-50 px-2">Portal Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                <Input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 pl-12 rounded-2xl border-border/50 font-bold text-lg focus-visible:ring-primary"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase opacity-50 px-2">Mobile Number (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                <Input
                                    placeholder="+1 (555) 000-0000"
                                    className="h-14 pl-12 rounded-2xl border-border/50 font-bold text-lg focus-visible:ring-primary"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 rounded-2xl font-semibold text-h3 uppercase gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                                Create Parent Account
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-muted/30 border border-border/50">
                <p className="text-xs font-bold text-muted-foreground text-center leading-relaxed">
                    Once the account is created, you will be redirected to the profile where you can link students to this parent.
                    The parent will be able to log in immediately using the credentials provided above.
                </p>
            </div>
        </div>
    );
}
