'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { academicExportService } from '@/services/academicExportService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, FileText, Download, QrCode, CheckCircle2, XCircle, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Transcript {
  id: string;
  transcriptNo?: string;
  student?: { firstName: string; lastName: string; studentNumber?: string };
  session?: string;
  status?: string;
  createdAt?: string;
  verificationCode?: string;
  fileUrl?: string;
}

export function TranscriptUI() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Transcript[]>([]);
  const [studentId, setStudentId] = useState('');
  const [busy, setBusy] = useState(false);
  const [viewingTranscript, setViewingTranscript] = useState<Transcript | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await AcademicService.transcripts());
    } catch {
      toast.error('Unable to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!studentId.trim()) return;
    setBusy(true);
    try {
      await AcademicService.generateTranscript(studentId.trim());
      toast.success('Transcript generated successfully');
      setStudentId('');
      await load();
    } catch {
      toast.error('Failed to generate transcript');
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      await academicExportService.startExport(type, { studentId: studentId || undefined });
      toast.success(`Export ${type} queued`);
    } catch {
      toast.error('Export failed');
    }
  };

  const columns: Column<Transcript>[] = [
    { key: 'transcriptNo', header: 'Transcript No', render: (v) => <span className="font-mono font-medium">{v || '—'}</span> },
    {
      key: 'student',
      header: 'Student',
      render: (_, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—',
    },
    { key: 'session', header: 'Session' },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <StatusBadge status={v || 'PENDING'} />,
    },
    {
      key: 'createdAt',
      header: 'Generated',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setViewingTranscript(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          {row.fileUrl && (
            <Button size="sm" variant="ghost" asChild>
              <a href={row.fileUrl} download><Download className="h-4 w-4" /></a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Generate Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID..."
            />
          </div>
          <Button onClick={generate} disabled={busy || !studentId.trim()}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate
          </Button>
          <Button variant="outline" onClick={() => handleExport('TRANSCRIPT')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </CardContent>
      </Card>

      <AcademicTable columns={columns} data={items} loading={loading} onRefresh={load} keyExtractor={(i) => i.id || i.transcriptNo || ''} emptyMessage="No transcripts generated yet" />

      <Dialog open={!!viewingTranscript} onOpenChange={() => setViewingTranscript(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transcript Details</DialogTitle>
          </DialogHeader>
          {viewingTranscript && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Transcript No</Label>
                  <p className="font-mono text-lg font-semibold">{viewingTranscript.transcriptNo || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p><StatusBadge status={viewingTranscript.status || 'PENDING'} /></p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Student</Label>
                  <p className="font-medium">{viewingTranscript.student ? `${viewingTranscript.student.firstName} ${viewingTranscript.student.lastName}` : '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Session</Label>
                  <p>{viewingTranscript.session || '—'}</p>
                </div>
                {viewingTranscript.verificationCode && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Verification Code</Label>
                    <p className="font-mono text-lg font-bold tracking-wider text-primary">{viewingTranscript.verificationCode}</p>
                  </div>
                )}
              </div>
              {viewingTranscript.fileUrl && (
                <Button className="w-full" asChild>
                  <a href={viewingTranscript.fileUrl} download><Download className="mr-2 h-4 w-4" /> Download PDF</a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
