'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResultCheckerService, CheckerResponse, VerifyCodeResponse } from '@/services/resultCheckerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, ShieldX, Download, Loader2, Search, GraduationCap } from 'lucide-react';

function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export default function ResultCheckerPage() {
    const searchParams = useSearchParams();
    const qrCode = searchParams.get('code');

    const [codeResult, setCodeResult] = useState<VerifyCodeResponse | null>(null);
    const [codeLoading, setCodeLoading] = useState(!!qrCode);

    const [admissionNumber, setAdmissionNumber] = useState('');
    const [dob, setDob] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<CheckerResponse | null>(null);
    const [downloadingCode, setDownloadingCode] = useState<string | null>(null);

    useEffect(() => {
        if (!qrCode) return;
        ResultCheckerService.verifyCode(qrCode)
            .then(setCodeResult)
            .catch(() => setCodeResult({ valid: false, reason: 'Could not verify this code' }))
            .finally(() => setCodeLoading(false));
    }, [qrCode]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        setSearchResult(null);
        try {
            const result = await ResultCheckerService.checkByAdmissionNumber(admissionNumber, dob);
            setSearchResult(result);
        } catch {
            setSearchResult({ found: false, message: 'Something went wrong. Please try again.' });
        } finally {
            setSearching(false);
        }
    };

    const handleDownload = async (code: string, sessionName: string, term: string) => {
        setDownloadingCode(code);
        try {
            const blob = await ResultCheckerService.downloadPdf(code);
            downloadBlob(blob, `ReportCard_${sessionName}_${term}.pdf`.replace(/\s+/g, '_'));
        } catch {
            // no-op: button returns to its normal state, user can retry
        } finally {
            setDownloadingCode(null);
        }
    };

    // QR / link fast path: a code was supplied in the URL, show its result directly.
    if (qrCode) {
        const isValid = codeResult?.valid === true;
        return (
            <main className="mx-auto flex min-h-screen max-w-2xl items-center p-4">
                <Card className="w-full rounded-lg overflow-hidden">
                    <div className={`h-2 ${codeLoading ? 'bg-muted' : isValid ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            {codeLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : isValid ? (
                                <ShieldCheck className="h-8 w-8 text-emerald-600" />
                            ) : (
                                <ShieldX className="h-8 w-8 text-red-600" />
                            )}
                            <div>
                                <CardTitle className="text-xl">Result Verification</CardTitle>
                                <p className="text-sm text-muted-foreground">Official verification of a published academic result</p>
                            </div>
                        </div>
                        <Badge className="w-fit text-sm px-3 py-1" variant={isValid ? 'default' : 'destructive'}>
                            {codeLoading ? 'Verifying...' : isValid ? 'VERIFIED' : 'NOT VERIFIED'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        {codeLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : !isValid ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                {codeResult?.reason || 'This result could not be verified.'}
                            </p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Student" value={codeResult?.studentName} />
                                <Field label="Class" value={codeResult?.className} />
                                <Field label="Session" value={codeResult?.sessionName} />
                                <Field label="Term" value={codeResult?.term} />
                                <Field label="Average" value={codeResult?.average} />
                                <Field label="Grade" value={codeResult?.finalGrade} />
                                <Field label="Class Position" value={codeResult?.classPosition} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        );
    }

    // Manual entry path: admission number + date of birth.
    return (
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-4">
            <Card className="rounded-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-xl">Result Checker</CardTitle>
                            <p className="text-sm text-muted-foreground">Enter the student's admission number and date of birth to view published results.</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admissionNumber">Admission Number</Label>
                            <Input
                                id="admissionNumber"
                                value={admissionNumber}
                                onChange={(e) => setAdmissionNumber(e.target.value)}
                                placeholder="e.g. ABS/2024/040"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={searching} className="w-full">
                            {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                            Check Result
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {searchResult && (
                <Card className="rounded-lg">
                    <CardContent className="pt-6">
                        {!searchResult.found ? (
                            <p className="text-sm text-muted-foreground text-center py-4">{searchResult.message}</p>
                        ) : !searchResult.results?.length ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {searchResult.studentName} — no published results are available yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Results for <span className="font-semibold text-foreground">{searchResult.studentName}</span> ({searchResult.className})
                                </p>
                                {searchResult.results.map((row) => (
                                    <div key={row.code} className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold">{row.sessionName} — {row.term} Term</p>
                                            <p className="text-sm text-muted-foreground">
                                                Average: {row.average ?? '—'} · Grade: {row.finalGrade ?? '—'} · Position: {row.classPosition ?? '—'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={downloadingCode === row.code}
                                            onClick={() => handleDownload(row.code, row.sessionName, row.term)}
                                        >
                                            {downloadingCode === row.code ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Download className="h-4 w-4 mr-2" />
                                            )}
                                            Download PDF
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </main>
    );
}

function Field({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="rounded-lg border bg-muted/30 p-4">
            <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
            <p className="text-lg font-semibold">{value || '—'}</p>
        </div>
    );
}
