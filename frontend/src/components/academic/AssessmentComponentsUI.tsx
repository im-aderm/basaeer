'use client';

import { useEffect, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { AcademicTable, Column, StatusBadge } from './AcademicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Table2, Percent, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface Component {
  id?: string;
  name: string;
  component?: string;
  weight: number;
  maxScore: number;
  classId?: string;
  subjectId?: string;
  curriculum?: string;
  status?: string;
}

export function AssessmentComponentsUI() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Component[]>([]);
  const [form, setForm] = useState({ name: '', component: '', weight: '', maxScore: '100', classId: '', subjectId: '', curriculum: '' });

  const load = async () => {
    setLoading(true);
    try {
      setItems(await AcademicService.listComponents());
    } catch {
      toast.error('Unable to load assessment components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name) return;
    setBusy(true);
    try {
      await AcademicService.createComponent({
        ...form,
        weight: Number(form.weight),
        maxScore: Number(form.maxScore),
      });
      toast.success('Assessment component created');
      setForm({ name: '', component: '', weight: '', maxScore: '100', classId: '', subjectId: '', curriculum: '' });
      await load();
    } catch {
      toast.error('Failed to create assessment component');
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Component>[] = [
    { key: 'name', header: 'Name', render: (v) => <span className="font-medium">{v || '—'}</span> },
    { key: 'component', header: 'Type', render: (v) => v ? <StatusBadge status={v} /> : '—' },
    {
      key: 'weight',
      header: 'Weight',
      render: (v) => (
        <div className="flex items-center gap-2">
          <Percent className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium tabular-nums">{v}%</span>
        </div>
      ),
    },
    {
      key: 'maxScore',
      header: 'Max Score',
      render: (v) => (
        <div className="flex items-center gap-2">
          <Hash className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium tabular-nums">{v}</span>
        </div>
      ),
    },
    { key: 'classId', header: 'Class' },
    { key: 'subjectId', header: 'Subject' },
    { key: 'curriculum', header: 'Curriculum' },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Add Assessment Component</CardTitle>
          <p className="text-sm text-muted-foreground">Define how marks are weighted (e.g., Assignment = 10%, Test = 20%, Exam = 70%).</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2"><Label htmlFor="ac-name">Component Name</Label><Input id="ac-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Assignment 1" /></div>
            <div className="space-y-2"><Label htmlFor="ac-type">Type</Label><Input id="ac-type" value={form.component} onChange={e => setForm(p => ({ ...p, component: e.target.value }))} placeholder="ASSIGNMENT/TEST/EXAM" /></div>
            <div className="space-y-2"><Label htmlFor="ac-weight">Weight (%)</Label><Input id="ac-weight" type="number" min={0} max={100} value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 10" /></div>
            <div className="space-y-2"><Label htmlFor="ac-max">Max Score</Label><Input id="ac-max" type="number" min={1} value={form.maxScore} onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))} placeholder="100" /></div>
            <div className="space-y-2"><Label htmlFor="ac-class">Class ID</Label><Input id="ac-class" value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="ac-subject">Subject ID</Label><Input id="ac-subject" value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="ac-curriculum">Curriculum</Label><Input id="ac-curriculum" value={form.curriculum} onChange={e => setForm(p => ({ ...p, curriculum: e.target.value }))} /></div>
            <div className="flex items-end">
              <Button onClick={create} disabled={busy || !form.name || !form.weight} className="w-full">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Table2 className="mr-2 h-4 w-4" />}
                Add Component
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AcademicTable columns={columns} data={items} loading={loading} onRefresh={load} keyExtractor={(i) => i.id || i.name || Math.random().toString()} emptyMessage="No assessment components configured" />
    </div>
  );
}
