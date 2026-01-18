'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Download, Trash2, Plus, Clock, FileType, HardDrive } from 'lucide-react';
import { SettingsService, Backup } from '@/services/settingsService';
import { toast } from 'sonner';

export default function BackupManagementPage() {
    const { user } = useAuth();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const fetchBackups = async () => {
        try {
            const data = await SettingsService.getBackups();
            setBackups(data);
        } catch (error) {
            toast.error('Failed to load backups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        setIsCreating(true);
        try {
            await SettingsService.createBackup();
            toast.success('Database backup created successfully');
            fetchBackups();
        } catch (error) {
            toast.error('Failed to create backup');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!confirm('Are you sure you want to delete this backup?')) return;
        try {
            await SettingsService.deleteBackup(filename);
            toast.success('Backup deleted');
            fetchBackups();
        } catch (error) {
            toast.error('Failed to delete backup');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) return <div className="p-8">Loading backup history...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic">Database Backups</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage and secure your school data with manual snapshots.</p>
                </div>
                <Button
                    onClick={handleCreateBackup}
                    disabled={isCreating}
                    className="h-14 px-8 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] transition-all"
                >
                    <Plus className="h-6 w-6" />
                    {isCreating ? 'Creating Snapshot...' : 'Create New Backup'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-primary/5 border-l-4 border-l-primary/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Total Backups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-black italic">{backups.length}</span>
                            <HardDrive className="h-8 w-8 text-primary/40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Storage Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-black italic">Healthy</span>
                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-amber-500/5 border-l-4 border-l-amber-500/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Latest Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                            <span className="font-bold italic text-amber-900/70">
                                {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString() : 'No backups found'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        Backup History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black italic px-8 uppercase tracking-tighter text-muted-foreground">Snapshot File</TableHead>
                                <TableHead className="font-black italic px-8 h-16 uppercase tracking-tighter text-muted-foreground">File Size</TableHead>
                                <TableHead className="font-black italic px-8 h-16 uppercase tracking-tighter text-muted-foreground">Created At</TableHead>
                                <TableHead className="font-black italic px-8 h-16 text-right uppercase tracking-tighter text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {backups.map((b) => (
                                <TableRow key={b.filename} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                                <FileType className="h-5 w-5" />
                                            </div>
                                            <span className="font-black italic text-lg leading-tight truncate max-w-[300px]">{b.filename}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-muted-foreground">
                                        {formatSize(b.size)}
                                    </TableCell>
                                    <TableCell className="px-8 font-medium italic">
                                        {new Date(b.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                                                onClick={() => SettingsService.downloadBackup(b.filename)}
                                            >
                                                <Download className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteBackup(b.filename)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {backups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                            <Database className="h-20 w-20 stroke-[1]" />
                                            <p className="font-black italic text-xl">No database snapshots found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
