'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen, TrendingUp, Award, Star } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface TahfeezRecord {
  id?: string;
  student?: { firstName: string; lastName: string };
  surah?: string;
  juz?: number;
  memorizationScore?: number;
  tajweedScore?: number;
  fluencyScore?: number;
  revisionScore?: number;
  totalScore?: number;
  status?: string;
  createdAt?: string;
}

export function TahfeezUI() {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<TahfeezRecord[]>([]);
  const [form, setForm] = useState({ studentId: '', sessionId: '', term: 'FIRST', surah: '', juz: '', memorizationScore: '', tajweedScore: '', fluencyScore: '', revisionScore: '' });

  const load = async () => {
    setLoading(true);
    try {
      setItems(await AcademicService.listComponents());
    } catch {
      showError('Unable to load tahfeez records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.studentId) return;
    setBusy(true);
    try {
      await AcademicService.assessTahfeez({
        studentId: form.studentId,
        sessionId: form.sessionId,
        term: form.term,
        surah: form.surah,
        juz: form.juz ? Number(form.juz) : undefined,
        memorizationScore: Number(form.memorizationScore),
        tajweedScore: Number(form.tajweedScore),
        fluencyScore: Number(form.fluencyScore),
        revisionScore: Number(form.revisionScore),
      });
      showSuccess('Tahfeez assessment recorded');
      setForm({ studentId: '', sessionId: '', term: 'FIRST', surah: '', juz: '', memorizationScore: '', tajweedScore: '', fluencyScore: '', revisionScore: '' });
      await load();
    } catch {
      showError('Failed to record assessment');
    } finally {
      setBusy(false);
    }
  };

  const aggregateScore = () => {
    const m = Number(form.memorizationScore) || 0;
    const t = Number(form.tajweedScore) || 0;
    const f = Number(form.fluencyScore) || 0;
    const r = Number(form.revisionScore) || 0;
    if (m === 0 && t === 0 && f === 0 && r === 0) return 0;
    return Math.round((m + t + f + r) / 4);
  };

  const total = aggregateScore();

  const columns: Column<TahfeezRecord>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (_, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—',
    },
    { key: 'surah', header: 'Surah' },
    { key: 'juz', header: 'Juz', render: (v) => v ? `Juz ${v}` : '—' },
    {
      key: 'memorizationScore',
      header: 'Memorization',
      render: (v) => <ScoreBar value={v || 0} />,
    },
    {
      key: 'tajweedScore',
      header: 'Tajweed',
      render: (v) => <ScoreBar value={v || 0} />,
    },
    {
      key: 'fluencyScore',
      header: 'Fluency',
      render: (v) => <ScoreBar value={v || 0} />,
    },
    {
      key: 'revisionScore',
      header: 'Revision',
      render: (v) => <ScoreBar value={v || 0} />,
    },
    {
      key: 'totalScore',
      header: 'Total',
      render: (v) => v != null ? <span className="font-bold">{String(v)}%</span> : '—',
    },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v || 'PENDING'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="rounded-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">
                  {items.length > 0
                    ? Math.round(items.reduce((a, i) => a + (i.totalScore || 0), 0) / items.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Score</p>
                <p className="text-2xl font-bold">
                  {items.length > 0
                    ? Math.max(...items.map(i => i.totalScore || 0))
                    : 0}%
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Juz Covered</p>
                <p className="text-2xl font-bold">{[...new Set(items.map(i => i.juz).filter(Boolean))].length}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Record Tahfeez Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="ta-student">Student ID</Label>
              <Input id="ta-student" value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} placeholder="e.g. STUD-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-session">Session</Label>
              <Input id="ta-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} placeholder="Session ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-term">Term</Label>
              <Select value={form.term} onValueChange={v => setForm(p => ({ ...p, term: v }))}>
                <SelectTrigger id="ta-term"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First Term</SelectItem>
                  <SelectItem value="SECOND">Second Term</SelectItem>
                  <SelectItem value="THIRD">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-surah">Surah</Label>
              <Input id="ta-surah" value={form.surah} onChange={e => setForm(p => ({ ...p, surah: e.target.value }))} placeholder="Surah name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-juz">Juz</Label>
              <Input id="ta-juz" type="number" min={1} max={30} value={form.juz} onChange={e => setForm(p => ({ ...p, juz: e.target.value }))} placeholder="1-30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-mem">Memorization Score</Label>
              <Input id="ta-mem" type="number" min={0} max={100} value={form.memorizationScore} onChange={e => setForm(p => ({ ...p, memorizationScore: e.target.value }))} placeholder="0-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-tajweed">Tajweed Score</Label>
              <Input id="ta-tajweed" type="number" min={0} max={100} value={form.tajweedScore} onChange={e => setForm(p => ({ ...p, tajweedScore: e.target.value }))} placeholder="0-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-flu">Fluency Score</Label>
              <Input id="ta-flu" type="number" min={0} max={100} value={form.fluencyScore} onChange={e => setForm(p => ({ ...p, fluencyScore: e.target.value }))} placeholder="0-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ta-rev">Revision Score</Label>
              <Input id="ta-rev" type="number" min={0} max={100} value={form.revisionScore} onChange={e => setForm(p => ({ ...p, revisionScore: e.target.value }))} placeholder="0-100" />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={submit} disabled={busy || !form.studentId} className="flex-1">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Record Assessment
              </Button>
              {total > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Total:</span>
                  <span className="text-lg font-bold text-primary">{total}%</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AcademicTable
        columns={columns}
        data={items}
        loading={loading}
        onRefresh={load}
        keyExtractor={(i) => i.id || Math.random().toString()}
        emptyMessage="No tahfeez assessments recorded"
      />
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : value >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums">{value}%</span>
    </div>
  );
}
