'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AcademicService } from '@/services/academicService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldX, QrCode, Hash, User, GraduationCap, Calendar, Loader2 } from 'lucide-react';

export default function PublicTranscriptVerificationPage() {
    const params = useParams<{ code: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.code) return;
        AcademicService.verifyTranscript(params.code)
            .then(setData)
            .catch(() => setData({ valid: false }))
            .finally(() => setLoading(false));
    }, [params.code]);

    const isValid = data?.valid === true;

    return (
        <main className="mx-auto flex min-h-screen max-w-3xl items-center p-4">
            <Card className="w-full rounded-lg overflow-hidden">
                <div className={`h-2 ${loading ? 'bg-muted' : isValid ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : isValid ? (
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        ) : (
                            <ShieldX className="h-8 w-8 text-red-600" />
                        )}
                        <div>
                            <CardTitle className="text-xl">Transcript Verification</CardTitle>
                            <p className="text-sm text-muted-foreground">Official verification of academic records — Basaer College</p>
                        </div>
                    </div>
                    <Badge className="w-fit text-sm px-3 py-1" variant={isValid ? 'default' : 'destructive'}>
                        {loading ? 'Verifying...' : isValid ? 'VERIFIED — Authentic Document' : 'INVALID — Verification Failed'}
                    </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center space-y-3">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                                <p className="text-sm text-muted-foreground">Verifying transcript authenticity...</p>
                            </div>
                        </div>
                    ) : !isValid ? (
                        <div className="flex flex-col items-center py-12 text-center space-y-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                <ShieldX className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold">Transcript Not Authenticated</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                The verification code <span className="font-mono font-bold text-foreground">{params.code}</span> could not be authenticated. 
                                The transcript may be revoked, expired, or the code may be incorrect.
                            </p>
                            {data?.message && (
                                <Badge variant="outline" className="text-xs">{data.message}</Badge>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center py-6">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                                    <ShieldCheck className="h-10 w-10 text-emerald-600" />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {data.transcriptNo && (
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground uppercase">Transcript No</span>
                                        </div>
                                        <p className="text-lg font-mono font-bold">{data.transcriptNo}</p>
                                    </div>
                                )}

                                {data.student && (
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground uppercase">Student</span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {typeof data.student === 'object'
                                                ? `${data.student.firstName || ''} ${data.student.lastName || ''}`
                                                : String(data.student)}
                                        </p>
                                    </div>
                                )}

                                {(data.session || data.academicSession) && (
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground uppercase">Academic Session</span>
                                        </div>
                                        <p className="text-lg font-semibold">{data.session || data.academicSession}</p>
                                    </div>
                                )}

                                {data.graduationYear && (
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground uppercase">Graduation Year</span>
                                        </div>
                                        <p className="text-lg font-semibold">{data.graduationYear}</p>
                                    </div>
                                )}
                            </div>

                            {data.verificationCode && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <QrCode className="h-4 w-4 text-emerald-700" />
                                        <span className="text-xs font-medium text-emerald-700 uppercase">Verification Checksum</span>
                                    </div>
                                    <p className="font-mono text-lg font-bold tracking-widest text-emerald-800">{data.verificationCode}</p>
                                </div>
                            )}

                            <div className="rounded-lg bg-muted/50 p-4 text-center">
                                <p className="text-xs text-muted-foreground">
                                    This transcript was verified on <span className="font-medium">{new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>.
                                    For questions, contact <span className="font-medium">Basaer College Registrar</span>.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
