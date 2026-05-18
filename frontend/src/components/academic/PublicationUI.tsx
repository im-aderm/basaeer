'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Settings } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export function PublicationUI() {
  const { showSuccess, showError, showInfo } = useNotification();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ sessionId: '', term: 'FIRST', classId: '', sectionId: '' });
  const [computeJobId, setComputeJobId] = useState<string | null>(null);
  const [computeStatus, setComputeStatus] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      // Publication items may come from a specific endpoint; reusing broad data
      setItems(await AcademicService.approvals());
    } catch {
      showError('Unable to load publications');
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
          status.status === 'completed' ? showSuccess('Computation completed') : showError('Computation failed');
          if (status.status === 'completed') load();
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [computeJobId]);

  const publish = async () => {
    setBusy(true);
    try {
      await AcademicService.publish(form);
      showSuccess('Results published successfully');
      await load();
    } catch {
      showError('Publication failed');
    } finally {
      setBusy(false);
    }
  };

  const startCompute = async () => {
    setBusy(true);
    try {
      const { jobId } = await AcademicService.computeSection(form);
      setComputeJobId(jobId);
      showInfo('Computation started');
    } catch {
      showError('Failed to start computation');
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<any>[] = [
    { key: 'title', header: 'Title', render: (v) => <span className="font-medium">{v || '—'}</span> },
    { key: 'section', header: 'Section', render: (_, row) => row.section || row.sectionId || '—' },
    { key: 'term', header: 'Term' },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v || 'UNPUBLISHED'} /> },
    { key: 'createdAt', header: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Publish Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label htmlFor="pub-session">Session ID</Label><Input id="pub-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="pub-class">Class ID</Label><Input id="pub-class" value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="pub-section">Section ID</Label><Input id="pub-section" value={form.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="pub-term">Term</Label><Input id="pub-term" value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} /></div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={publish} disabled={busy} className="flex-1"><CheckCircle2 className="mr-2 h-4 w-4" />Publish Results</Button>
              <Button onClick={startCompute} disabled={busy || !!computeJobId} variant="secondary">
                {computeJobId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                {computeJobId ? `${computeStatus?.progress || 0}%` : 'Recompute'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AcademicTable columns={columns} data={items} loading={loading} onRefresh={load} keyExtractor={(i) => i.id || Math.random().toString()} emptyMessage="No publications yet" />
    </div>
  );
}
