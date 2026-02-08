"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Award, User, Calendar, MapPin, Building2 } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
    const { code } = useParams();
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const verifyCertificate = async () => {
            try {
                const res = await api.get(`/certificates/verify/${code}`);
                if (res.data) {
                    setCertificate(res.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Verification failed:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (code) verifyCertificate();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-xl font-bold italic text-slate-600">Verifying authenticity...</p>
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full rounded-[3rem] border-none shadow-2xl p-8 text-center bg-white">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black italic tracking-tighter mb-4 text-slate-900">Invalid Certificate</h1>
                    <p className="text-slate-500 font-medium mb-8">
                        The verification code provided does not match our records. This certificate could not be verified.
                    </p>
                    <Button
                        asChild
                        className="w-full h-14 rounded-2xl font-black text-lg bg-slate-900 hover:bg-slate-800"
                    >
                        <a href="/">Go to Homepage</a>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <Card className="max-w-2xl w-full rounded-[4rem] border-none shadow-2xl overflow-hidden bg-white">
                <div className="h-4 bg-primary w-full" />
                <CardHeader className="p-12 text-center border-b border-slate-50">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <CardTitle className="text-4xl font-black italic tracking-tighter text-slate-900">Verified Authentic</CardTitle>
                    <p className="text-green-600 font-bold uppercase tracking-[0.2em] text-sm mt-2">Basaeer Digital Certification Registry</p>
                </CardHeader>
                <CardContent className="p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recipient Name</label>
                            <div className="flex items-center gap-3 text-xl font-black italic text-slate-800">
                                <User size={20} className="text-primary" />
                                {certificate.student.firstName} {certificate.student.lastName}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Certificate Type</label>
                            <div className="flex items-center gap-3 text-xl font-black italic text-slate-800">
                                <Award size={20} className="text-primary" />
                                {certificate.type.replace('_', ' ')}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Issue Date</label>
                            <div className="flex items-center gap-3 text-xl font-bold text-slate-800">
                                <Calendar size={20} className="text-primary" />
                                {new Date(certificate.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Reference Number</label>
                            <div className="bg-slate-50 px-4 py-2 rounded-xl text-lg font-mono font-bold text-slate-600 inline-block border border-slate-100">
                                {certificate.certificateNumber}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-4">
                        <div className="flex items-start gap-4">
                            <Building2 className="text-primary mt-1" />
                            <div>
                                <h4 className="font-black italic text-lg tracking-tight">Issuing Institution</h4>
                                <p className="text-slate-400 font-bold tracking-tight">{certificate.student.branch.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="text-primary mt-1" />
                            <div>
                                <h4 className="font-black italic text-lg tracking-tight">Branch Code</h4>
                                <p className="text-slate-400 font-bold tracking-tight">{certificate.student.branch.code}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Verification Hash</p>
                        <p className="text-[10px] font-mono text-slate-400 break-all text-center max-w-sm">{certificate.verificationCode}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
