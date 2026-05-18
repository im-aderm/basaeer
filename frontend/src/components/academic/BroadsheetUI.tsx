'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { academicExportService } from '@/services/academicExportService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Table2, Download } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export function BroadsheetUI() {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ sectionId: '', sessionId: '', term: 'FIRST' });
  const [exports, setExports] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      setExports(await academicExportService.getExports());
    } catch {
      // may be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleExport = async () => {
    if (!form.sectionId) return;
    setBusy(true);
    try {
      await academicExportService.startExport('BROADSHEET', form);
      showSuccess('Broadsheet export queued');
      await load();
    } catch {
      showError('Export failed');
    } finally {
      setBusy(false);
    }
  };

  const broadsheetExports = exports.filter(e => e.type === 'BROADSHEET');

  const columns: Column<any>[] = [
    { key: 'type', header: 'Type', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'progress', header: 'Progress', render: (v) => v != null ? `${v}%` : '—' },
    {
      key: 'fileUrl', header: 'Download', render: (v, row) => v ? (
        <Button size="sm" variant="outline" asChild><a href={v} download={row.fileName}><Download className="mr-1 h-3 w-3" />PDF</a></Button>
      ) : <span className="text-xs text-muted-foreground">Processing...</span>,
    },
    { key: 'createdAt', header: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Generate Broadsheet</CardTitle>
          <p className="text-sm text-muted-foreground">Export a class broadsheet with all student results for the selected term.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="bs-section">Section ID</Label>
              <Input id="bs-section" value={form.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))} placeholder="Section ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bs-session">Session ID</Label>
              <Input id="bs-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} placeholder="Session ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bs-term">Term</Label>
              <Input id="bs-term" value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} placeholder="FIRST" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} disabled={busy || !form.sectionId} className="w-full">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Table2 className="mr-2 h-4 w-4" />}
                Generate Broadsheet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AcademicTable columns={columns} data={broadsheetExports} loading={loading} onRefresh={load} keyExtractor={(e) => e.id} emptyMessage="No broadsheets generated yet" />
    </div>
  );
}
