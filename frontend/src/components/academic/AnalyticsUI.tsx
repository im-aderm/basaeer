'use client';

import { useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, Users, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export function AnalyticsUI() {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [form, setForm] = useState({ sessionId: '', term: 'FIRST' });

  const load = async () => {
    if (!form.sessionId) return;
    setLoading(true);
    try {
      const data = await AcademicService.analytics({ sessionId: form.sessionId, term: form.term });
      setAnalytics(data);
    } catch {
      showError('Unable to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const chartData = analytics?.subjectBreakdown || [];
  const pieData = analytics?.gradeDistribution || [];

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Academic Analytics</CardTitle>
          <p className="text-sm text-muted-foreground">Performance metrics, grade distribution, and subject breakdown.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ana-session">Session ID</Label>
              <Input id="ana-session" value={form.sessionId} onChange={e => setForm(p => ({ ...p, sessionId: e.target.value }))} placeholder="Enter session ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ana-term">Term</Label>
              <Select value={form.term} onValueChange={v => setForm(p => ({ ...p, term: v }))}>
                <SelectTrigger id="ana-term"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First Term</SelectItem>
                  <SelectItem value="SECOND">Second Term</SelectItem>
                  <SelectItem value="THIRD">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={load} disabled={loading || !form.sessionId} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
                Load Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700"><Users className="h-5 w-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Students</p><p className="text-2xl font-bold">{analytics.totalStudents || 0}</p></div>
                </div>
              </CardHeader>
            </Card>
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><TrendingUp className="h-5 w-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Average Score</p><p className="text-2xl font-bold">{analytics.averageScore != null ? `${Math.round(analytics.averageScore)}%` : '—'}</p></div>
                </div>
              </CardHeader>
            </Card>
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Subjects</p><p className="text-2xl font-bold">{analytics.subjectCount || chartData.length}</p></div>
                </div>
              </CardHeader>
            </Card>
            <Card className="rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><AlertCircle className="h-5 w-5" /></div>
                  <div><p className="text-sm text-muted-foreground">Pass Rate</p><p className="text-2xl font-bold">{analytics.passRate != null ? `${Math.round(analytics.passRate)}%` : '—'}</p></div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card className="rounded-lg">
              <CardHeader><CardTitle className="text-lg">Subject Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Score" />
                    <Bar dataKey="highest" fill="#10b981" radius={[4, 4, 0, 0]} name="Highest Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {pieData.length > 0 && (
            <Card className="rounded-lg">
              <CardHeader><CardTitle className="text-lg">Grade Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="grade" label={({ name, value }: any) => `${name}: ${value}`}>
                      {pieData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BarChart3 className="mb-3 h-12 w-12" />
            <p className="text-sm">Enter a session ID and select a term to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
