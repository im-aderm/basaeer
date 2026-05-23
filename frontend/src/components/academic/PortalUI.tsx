'use client';

import { useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, TrendingUp, BookOpen, Award } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PortalUI() {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({ studentId: '', sessionId: '', term: 'FIRST' });

  const load = async () => {
    if (!form.studentId) return;
    setLoading(true);
    try {
      const data = await AcademicService.portalResult(form.studentId, form.sessionId, form.term);
      setResult(data);
    } catch {
      showError('Unable to load results');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const subjectResults = result?.subjects || [];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Academic Portal — View Results</CardTitle>
          <p className="text-sm text-muted-foreground">Enter student details to view academic results.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="port-student">Student ID</Label>
              <Input id="port-student" value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} placeholder="Student ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port-session">Session ID</Label>
              <Input id="port-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} placeholder="Session ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port-term">Term</Label>
              <Select value={form.term} onValueChange={v => setForm(p => ({ ...p, term: v }))}>
                <SelectTrigger id="port-term"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First Term</SelectItem>
                  <SelectItem value="SECOND">Second Term</SelectItem>
                  <SelectItem value="THIRD">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={load} disabled={loading || !form.studentId} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                View Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><TrendingUp className="h-5 w-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Average</p><p className="text-2xl font-bold">{result.average != null ? `${Math.round(result.average)}%` : '—'}</p></div>
                </div>
              </CardHeader>
            </Card>
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700"><BookOpen className="h-5 w-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Subjects</p><p className="text-2xl font-bold">{subjectResults.length}</p></div>
                </div>
              </CardHeader>
            </Card>
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Award className="h-5 w-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Position</p><p className="text-2xl font-bold">{result.position || '—'}</p></div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {subjectResults.length > 0 && (
            <Card className="rounded-lg">
              <CardHeader><CardTitle className="text-lg">Subject Results</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {subjectResults.map((subject: any, index: number) => (
                        <tr key={index} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{subject.name || subject.subject || `Subject ${index + 1}`}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Progress value={subject.score || 0} className="h-2 w-24" />
                              <span className="text-sm font-medium tabular-nums">{subject.score || 0}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge variant={subject.grade === 'A' || subject.grade === 'B' ? 'default' : 'secondary'}>{subject.grade || '—'}</Badge></td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{subject.remark || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {result.chartData && result.chartData.length > 0 && (
            <Card className="rounded-lg">
              <CardHeader><CardTitle className="text-lg">Performance Chart</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!result && !loading && (
        <Card className="rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="mb-3 h-12 w-12" />
            <p className="text-sm">Enter a student ID to view academic results</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
