'use client';

import { useState, useEffect } from 'react';
import { MarkEntrySpreadsheet } from '@/components/academic/MarkEntrySpreadsheet';
import { AcademicService } from '@/services/academicService';
import { ExamService } from '@/services/examService';
import { StudentService } from '@/services/studentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Table2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkMarkEntryPage() {
    const [view, setView] = useState<'select' | 'entry'>('select');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        classId: '',
        sectionId: '',
        subjectId: '',
        sessionId: '',
        term: 'FIRST'
    });
    const [students, setStudents] = useState<any[]>([]);

    const handleStartEntry = async () => {
        if (!formData.sectionId || !formData.subjectId || !formData.sessionId) {
            toast.error('Please select all required fields');
            return;
        }

        try {
            setLoading(true);
            const studentList = await StudentService.getStudentsBySection(formData.sectionId);
            
            // Transform for spreadsheet
            const formatted = studentList.map((s: any) => ({
                studentId: s.id,
                name: `${s.firstName} ${s.lastName}`,
                asgn1: 0,
                asgn2: 0,
                test1: 0,
                test2: 0,
                examScore: 0,
                total: 0
            }));
            
            setStudents(formatted);
            setView('entry');
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updates: any[]) => {
        try {
            await ExamService.submitScores({
                ...formData,
                scores: updates,
                examTerm: 'END_OF_TERM'
            });
            toast.success('Batch marks saved successfully');
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Save failed:', error);
            throw error;
        }
    };

    if (view === 'entry') {
        return (
            <div className="p-6 h-full">
                <MarkEntrySpreadsheet 
                    data={students} 
                    onSave={handleSave} 
                    onBack={() => setView('select')} 
                />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-h1 font-bold tracking-tight text-primary">Bulk Mark Entry</h1>
                <p className="text-gray-600 mt-1">High-performance spreadsheet interface for entering student marks</p>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Table2 className="w-5 h-5" />
                        Select Class & Subject
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Academic Session</Label>
                            <Input placeholder="Session ID" value={formData.sessionId} onChange={e => setFormData({...formData, sessionId: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Term</Label>
                            <select 
                                className="w-full h-10 px-3 py-2 bg-white/75 border border-primary/90 rounded-xl text-sm"
                                value={formData.term}
                                onChange={e => setFormData({...formData, term: e.target.value})}
                            >
                                <option value="FIRST">First Term</option>
                                <option value="SECOND">Second Term</option>
                                <option value="THIRD">Third Term</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Section ID</Label>
                            <Input placeholder="Section ID" value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject ID</Label>
                            <Input placeholder="Subject ID" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} />
                        </div>
                    </div>

                    <Button 
                        onClick={handleStartEntry} 
                        disabled={loading}
                        className="w-full h-12 text-lg font-bold"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        Open Entry Spreadsheet
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Simple Input component for the selection form
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="flex h-10 w-full rounded-md border-primary/60 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
    );
}
