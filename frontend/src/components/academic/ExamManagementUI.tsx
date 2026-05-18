'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, GraduationCap, Calendar } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface Exam {
  id: string;
  title: string;
  sessionId?: string;
  term?: string;
  classId?: string;
  sectionId?: string;
  startsAt?: string;
  status?: string;
  createdAt?: string;
}

export function ExamManagementUI() {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Exam[]>([]);
  const [form, setForm] = useState({ title: '', sessionId: '', term: 'FIRST', classId: '', sectionId: '', startsAt: '' });

  const load = async () => {
    setLoading(true);
    try {
      setItems(await AcademicService.listExams());
    } catch {
      showError('Unable to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title) return;
    setBusy(true);
    try {
      await AcademicService.createExam(form);
      showSuccess('Exam created');
      setForm({ title: '', sessionId: '', term: 'FIRST', classId: '', sectionId: '', startsAt: '' });
      await load();
    } catch {
      showError('Failed to create exam');
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Exam>[] = [
    { key: 'title', header: 'Title', render: (v) => <span className="font-medium">{v || '—'}</span> },
    { key: 'sessionId', header: 'Session' },
    { key: 'term', header: 'Term', render: (v) => <StatusBadge status={v || 'FIRST'} /> },
    { key: 'classId', header: 'Class' },
    { key: 'sectionId', header: 'Section' },
    { key: 'startsAt', header: 'Starts', render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v || 'PENDING'} /> },
    { key: 'createdAt', header: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Create Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="exam-title">Exam Title</Label>
              <Input id="exam-title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. First Term Mathematics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-term">Term</Label>
              <Input id="exam-term" value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} placeholder="FIRST" />
            </div>
            <div className="space-y-2"><Label htmlFor="exam-session">Session ID</Label><Input id="exam-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="exam-class">Class ID</Label><Input id="exam-class" value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="exam-section">Section ID</Label><Input id="exam-section" value={form.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="exam-date">Starts At</Label><Input id="exam-date" type="datetime-local" value={form.startsAt} onChange={e => setForm(p => ({ ...p, startsAt: e.target.value }))} /></div>
            <div className="flex items-end">
              <Button onClick={create} disabled={busy || !form.title} className="w-full">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GraduationCap className="mr-2 h-4 w-4" />}
                Create Exam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AcademicTable columns={columns} data={items} loading={loading} onRefresh={load} keyExtractor={(e) => e.id} emptyMessage="No exams created yet" />
    </div>
  );
}
