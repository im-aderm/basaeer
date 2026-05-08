'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AcademicService } from '@/services/academicService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldX } from 'lucide-react';

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

    return (
        <main className="mx-auto flex min-h-screen max-w-3xl items-center p-4">
            <Card className="w-full rounded-lg">
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        {data?.valid ? <ShieldCheck className="h-8 w-8 text-emerald-600" /> : <ShieldX className="h-8 w-8 text-red-600" />}
                        <CardTitle>Transcript Verification</CardTitle>
                    </div>
                    <Badge className="w-fit" variant={data?.valid ? 'default' : 'destructive'}>
                        {loading ? 'Checking' : data?.valid ? 'Verified' : 'Invalid or revoked'}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <pre className="max-h-[560px] overflow-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(data || { code: params.code }, null, 2)}</pre>
                </CardContent>
            </Card>
        </main>
    );
}
