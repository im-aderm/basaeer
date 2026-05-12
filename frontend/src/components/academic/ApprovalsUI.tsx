'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function ApprovalsUI() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ sessionId: '', term: 'FIRST', classId: '', sectionId: '', subjectId: '' });
  const [computeJobId, setComputeJobId] = useState<string | null>(null);
  const [computeStatus, setComputeStatus] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await AcademicService.approvals());
    } catch {
      toast.error('Unable to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!computeJobId) return;
    const interval = setInterval(async () => {
      try {
        const status = await AcademicService.getComputeStatus(computeJobId);
        setComputeStatus(status);
        if (status.status === 'completed' || status.status === 'failed') {
          setComputeJobId(null);
          if (status.status === 'completed') {
            toast.success('Computation completed');
            load();
          } else {
            toast.error(`Computation failed: ${status.failedReason || 'Unknown error'}`);
          }
        }
      } catch { /* ignore poll errors */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [computeJobId]);

  const submit = async () => {
    setBusy(true);
    try {
      await AcademicService.submitApproval(form);
      toast.success('Approval submitted');
      await load();
    } catch {
      toast.error('Approval submission failed');
    } finally {
      setBusy(false);
    }
  };

  const startCompute = async () => {
    setBusy(true);
    try {
      const { jobId } = await AcademicService.computeSection(form);
      setComputeJobId(jobId);
      toast.info('Computation started');
    } catch {
      toast.error('Failed to start computation');
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<any>[] = [
    { key: 'title', header: 'Title', render: (v) => <span className="font-medium">{v || '—'}</span> },
    { key: 'section', header: 'Section', render: (_, row) => row.section || row.sectionId || '—' },
    { key: 'term', header: 'Term' },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v || 'PENDING'} /> },
    { key: 'createdAt', header: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Submit Result for Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label htmlFor="app-session">Session ID</Label><Input id="app-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="app-class">Class ID</Label><Input id="app-class" value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="app-section">Section ID</Label><Input id="app-section" value={form.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="app-subject">Subject ID</Label><Input id="app-subject" value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="app-term">Term</Label><Input id="app-term" value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} /></div>
            <div className="flex items-end gap-2">
              <Button onClick={submit} disabled={busy} className="flex-1"><ShieldCheck className="mr-2 h-4 w-4" />Submit</Button>
              <Button onClick={startCompute} disabled={busy || !!computeJobId} variant="secondary">
                {computeJobId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                {computeJobId ? `Computing ${computeStatus?.progress || 0}%` : 'Compute'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AcademicTable columns={columns} data={items} loading={loading} onRefresh={load} keyExtractor={(i) => i.id || Math.random().toString()} emptyMessage="No approvals submitted" />
    </div>
  );
}
