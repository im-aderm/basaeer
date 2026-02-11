'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, Plus, Search, Trash2, CheckCircle2, Circle, FileText, ChevronRight, Hash, Edit2 } from 'lucide-react';
import { OnlineExamService, Question, QuestionGroup, QuestionType } from '@/services/onlineExamService';
import { toast } from 'sonner';

export default function QuestionBankPage() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<QuestionGroup[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    // Form state
    const [qType, setQType] = useState<QuestionType>(QuestionType.MCQ);
    const [qContent, setQContent] = useState('');
    const [qMarks, setQMarks] = useState('1');
    const [options, setOptions] = useState<{ content: string; isCorrect: boolean }[]>([
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
    ]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const groupsData = await OnlineExamService.getGroups();
                setGroups(groupsData);
                if (groupsData.length > 0) {
                    setSelectedGroupId(groupsData[0].id);
                }
            } catch (error) {
                toast.error('Failed to load question groups');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedGroupId) {
            fetchQuestions();
        }
    }, [selectedGroupId]);

    const fetchQuestions = async () => {
        try {
            const data = await OnlineExamService.getQuestions(selectedGroupId);
            setQuestions(data);
        } catch (error) {
            toast.error('Failed to load questions');
        }
    };

    const handleAddOption = () => {
        setOptions([...options, { content: '', isCorrect: false }]);
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleOptionChange = (index: number, content: string) => {
        const newOptions = [...options];
        newOptions[index].content = content;
        setOptions(newOptions);
    };

    const handleCorrectToggle = (index: number) => {
        const newOptions = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setOptions(newOptions);
    };

    const resetForm = () => {
        setQType(QuestionType.MCQ);
        setQContent('');
        setQMarks('1');
        setOptions([{ content: '', isCorrect: false }, { content: '', isCorrect: false }]);
        setEditingQuestionId(null);
    };

    const handleEditClick = (q: Question) => {
        setEditingQuestionId(q.id);
        setQType(q.type);
        setQContent(q.content);
        setQMarks(q.marks.toString());
        if (q.options) {
            setOptions(q.options.map(o => ({ content: o.content, isCorrect: !!o.isCorrect })));
        } else {
            setOptions([{ content: '', isCorrect: false }, { content: '', isCorrect: false }]);
        }
        setIsDialogOpen(true);
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await OnlineExamService.deleteQuestion(id);
            toast.success('Question deleted');
            fetchQuestions();
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    const handleCreateQuestion = async () => {
        if (!qContent.trim()) return;

        try {
            const payload = {
                type: qType,
                content: qContent,
                marks: parseFloat(qMarks),
                groupId: selectedGroupId,
                options: (qType === QuestionType.MCQ || qType === QuestionType.TRUE_FALSE) ? options : undefined
            };

            if (editingQuestionId) {
                await OnlineExamService.updateQuestion(editingQuestionId, payload as any);
                toast.success('Question updated');
            } else {
                await OnlineExamService.createQuestion(payload as any);
                toast.success('Question added to bank');
            }

            setIsDialogOpen(false);
            resetForm();
            fetchQuestions();
        } catch (error) {
            toast.error(editingQuestionId ? 'Failed to update question' : 'Failed to add question');
        }
    };

    if (loading) return <div className="p-8">Loading question bank...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar: Groups */}
            <div className="lg:col-span-1 space-y-4">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden bg-background border-t-8 border-t-primary/20">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-black italic">Target Group</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-2">
                        {groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroupId(group.id)}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold italic text-left ${selectedGroupId === group.id
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'hover:bg-muted text-muted-foreground'
                                    }`}
                            >
                                <span>{group.name}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${selectedGroupId === group.id ? 'translate-x-1' : ''}`} />
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Main Content: Questions */}
            <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight italic">Question Bank</h1>
                        <p className="text-muted-foreground font-medium mt-1">Manage and preview questions for the selected group.</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-8 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                <Plus className="h-6 w-6" />
                                Add Question
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[90vh] overflow-y-auto sidebar-scroll">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic">
                                    {editingQuestionId ? 'Edit Question' : 'Configure New Question'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest ml-1">Type</Label>
                                        <Select value={qType} onValueChange={(v) => {
                                            setQType(v as QuestionType);
                                            if (v === QuestionType.TRUE_FALSE) {
                                                setOptions([{ content: 'True', isCorrect: false }, { content: 'False', isCorrect: false }]);
                                            } else {
                                                setOptions([{ content: '', isCorrect: false }, { content: '', isCorrect: false }]);
                                            }
                                        }}>
                                            <SelectTrigger className="h-12 rounded-2xl bg-muted/50 font-bold border-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value={QuestionType.MCQ}>Multiple Choice</SelectItem>
                                                <SelectItem value={QuestionType.TRUE_FALSE}>True / False</SelectItem>
                                                <SelectItem value={QuestionType.DESCRIPTIVE}>Descriptive / Theory</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest ml-1">Marks</Label>
                                        <Input
                                            type="number"
                                            className="h-12 rounded-2xl border-none bg-muted/50 font-bold text-center text-xl"
                                            value={qMarks}
                                            onChange={(e) => setQMarks(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest ml-1">Question Content</Label>
                                    <textarea
                                        className="w-full min-h-[120px] rounded-3xl p-6 bg-muted/50 border-none font-bold text-lg focus:ring-2 ring-primary/20 outline-none"
                                        placeholder="Type your question here..."
                                        value={qContent}
                                        onChange={(e) => setQContent(e.target.value)}
                                    />
                                </div>

                                {(qType === QuestionType.MCQ || qType === QuestionType.TRUE_FALSE) && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-black uppercase tracking-widest ml-1">Options & Answers</Label>
                                            {qType === QuestionType.MCQ && (
                                                <Button variant="ghost" size="sm" onClick={handleAddOption} className="rounded-full font-bold text-primary">
                                                    <Plus className="h-4 w-4 mr-1" /> Add Option
                                                </Button>
                                            )}
                                        </div>
                                        {options.map((opt, idx) => (
                                            <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-left-2 duration-200">
                                                <button
                                                    onClick={() => handleCorrectToggle(idx)}
                                                    className={`h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    {opt.isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                                </button>
                                                <Input
                                                    placeholder={`Option ${idx + 1}`}
                                                    className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                                    value={opt.content}
                                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                    disabled={qType === QuestionType.TRUE_FALSE}
                                                />
                                                {qType === QuestionType.MCQ && options.length > 2 && (
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)} className="text-destructive h-12 w-12 rounded-2xl">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" className="rounded-2xl h-12 font-bold" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                                <Button className="rounded-2xl h-12 font-black px-12" onClick={handleCreateQuestion}>Save Question</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <Card key={q.id} className="rounded-[2rem] border-border/50 shadow-xl overflow-hidden hover:scale-[1.01] transition-all">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black italic">
                                            {idx + 1}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 rounded-full bg-muted text-[10px] font-black uppercase tracking-widest">{q.type}</span>
                                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest">{q.marks} Marks</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-muted-foreground">
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:text-primary hover:bg-primary/10" onClick={() => handleEditClick(q)}>
                                            <Edit2 className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteQuestion(q.id)}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black italic mb-6 leading-relaxed">"{q.content}"</h3>

                                {q.options && q.options.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={opt.id} className={`flex items-center gap-3 p-4 rounded-2xl ${opt.isCorrect ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-muted/30'}`}>
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <span className={`font-bold italic ${opt.isCorrect ? 'text-emerald-700' : 'text-muted-foreground'}`}>{opt.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {questions.length === 0 && (
                        <div className="h-80 flex flex-col items-center justify-center gap-6 opacity-30 grayscale saturate-0">
                            <HelpCircle className="h-24 w-24 stroke-[1]" />
                            <div className="text-center">
                                <p className="font-black italic text-2xl">This questions group is empty</p>
                                <p className="font-medium">Selected group: {groups.find(g => g.id === selectedGroupId)?.name}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
