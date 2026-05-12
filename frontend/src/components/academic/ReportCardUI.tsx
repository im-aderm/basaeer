'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { academicExportService } from '@/services/academicExportService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

export function ReportCardUI() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ studentId: '', sessionId: '', term: 'FIRST' });
  const [exports, setExports] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      setExports(await academicExportService.getExports());
    } catch {
      // exports may be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    setBusy(true);
    try {
      await academicExportService.startExport('REPORT_CARD', form);
      toast.success('Report card export queued');
      await load();
    } catch {
      toast.error('Export failed');
    } finally {
      setBusy(false);
    }
  };

  const reportExports = exports.filter(e => e.type === 'REPORT_CARD');

  const columns: Column<any>[] = [
    { key: 'type', header: 'Type', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'progress', header: 'Progress', render: (v) => v != null ? `${v}%` : '—' },
    {
      key: 'fileUrl', header: 'Download', render: (v, row) => v ? (
        <Button size="sm" variant="outline" asChild><a href={v} download={row.fileName}><Download className="mr-1 h-3 w-3" />PDF</a></Button>
      ) : <span className="text-muted-foreground text-xs">Processing...</span>,
    },
    {
      key: 'createdAt', header: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Generate Report Card</CardTitle>
          <p className="text-sm text-muted-foreground">Export a student report card with grades, GPA, attendance, and remarks.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="rc-student">Student ID</Label>
              <Input id="rc-student" value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} placeholder="Student ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rc-session">Session ID</Label>
              <Input id="rc-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} placeholder="Session ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rc-term">Term</Label>
              <Select value={form.term} onValueChange={v => setForm(p => ({ ...p, term: v }))}>
                <SelectTrigger id="rc-term"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First Term</SelectItem>
                  <SelectItem value="SECOND">Second Term</SelectItem>
                  <SelectItem value="THIRD">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleExport} disabled={busy || !form.studentId} className="flex-1">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AcademicTable
        columns={columns}
        data={reportExports}
        loading={loading}
        onRefresh={load}
        keyExtractor={(e) => e.id}
        emptyMessage="No report cards generated yet"
      />
    </div>
  );
}
