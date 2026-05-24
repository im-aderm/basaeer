'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Download, Trash2, Plus, Clock, FileType, HardDrive } from 'lucide-react';
import { SettingsService, Backup } from '@/services/settingsService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function BackupManagementPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const fetchBackups = async () => {
        try {
            const data = await SettingsService.getBackups();
            setBackups(data);
        } catch (error) {
            showError('Failed to load backups');
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
            showSuccess('Database backup created successfully');
            fetchBackups();
        } catch (error) {
            showError('Failed to create backup');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        setConfirmDelete(filename);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await SettingsService.deleteBackup(confirmDelete);
            showSuccess('Backup deleted');
            fetchBackups();
        } catch (error) {
            showError('Failed to delete backup');
        }
        setConfirmDelete(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) return <div className="p-4">Loading backup history...</div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-5xl mx-auto space-y-6">
                <BranchContextBanner />
                <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Database Backups</h1>
                    <p className="text-foreground/60 font-medium mt-1 text-[12px]">Manage and secure your school data with manual snapshots.</p>
                </div>
                <Button
                    onClick={handleCreateBackup}
                    disabled={isCreating}
                    className="h-12 px-6 rounded-xl font-semibold text-[12px] gap-2 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-all"
                >
                    <Plus className="h-6 w-6" />
                    {isCreating ? 'Creating Snapshot...' : 'Create New Backup'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={STAT_CARD}>
                    <CardHeader className="pb-2">
                        <CardTitle className={STAT_LABEL}>Total Backups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <span className={STAT_VALUE}>{backups.length}</span>
                            <HardDrive className="h-6 w-6 text-primary/40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={STAT_CARD}>
                    <CardHeader className="pb-2">
                        <CardTitle className={STAT_LABEL}>Storage Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <span className={STAT_VALUE}>Healthy</span>
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={STAT_CARD}>
                    <CardHeader className="pb-2">
                        <CardTitle className={STAT_LABEL}>Latest Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-[12px] text-primary/70">
                                {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString() : 'No backups found'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-4 pb-4">
                    <CardTitle className="text-[12px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Database className="h-6 w-6 text-primary" />
                        Backup History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-primary/5 h-10">
                            <TableRow className="border-primary/20 hover:bg-transparent">
                                <TableHead className="font-semibold px-3 uppercase tracking-tighter text-primary/80 text-[12px]">Snapshot File</TableHead>
                                <TableHead className="font-semibold px-3 h-10 uppercase tracking-tighter text-primary/80 text-[12px]">File Size</TableHead>
                                <TableHead className="font-semibold px-3 h-10 uppercase tracking-tighter text-primary/80 text-[12px]">Created At</TableHead>
                                <TableHead className="font-semibold px-3 h-10 text-right uppercase tracking-tighter text-primary/80 text-[12px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-primary/20">
                            {backups.map((b) => (
                                <TableRow key={b.filename} className="border-primary/20 h-12 transition-all hover:bg-primary/[0.03]">
                                    <TableCell className="px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground/60">
                                                <FileType className="h-4 w-4" />
                                            </div>
                                            <span className="font-semibold text-[12px] leading-tight truncate max-w-[300px]">{b.filename}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 font-semibold text-[12px] text-foreground/60">
                                        {formatSize(b.size)}
                                    </TableCell>
                                    <TableCell className="px-3 font-medium text-[12px]">
                                        {new Date(b.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right px-3">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg border-primary/20 text-primary hover:bg-primary/10"
                                                onClick={() => { SettingsService.downloadBackup(b.filename); }}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteBackup(b.filename)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {backups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-30 grayscale saturate-0">
                                            <Database className="h-12 w-12 stroke-[1]" />
                                            <p className="font-semibold text-[12px]">No database snapshots found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Backup"
                message="Are you sure you want to delete this backup? This action cannot be undone."
                confirmLabel="Delete"
            />
            </div>
        </RequireBranch>
    );
}
