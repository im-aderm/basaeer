'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, AlertCircle, CheckCircle2, XCircle, FileSpreadsheet, FileArchive, Info, Image as ImageIcon, FileText, Loader2, Clock } from 'lucide-react';
import { OnlineAdmissionService } from '@/services/onlineAdmissionService';
import api from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from '@/lib/table-styles';

interface ImportJobStatus {
    jobId: string;
    status: 'waiting' | 'active' | 'delayed' | 'completed' | 'failed' | 'paused';
    progress: number;
    result: {
        success: number;
        failed: number;
        total: number;
        details: string[];
        parsingErrors: string[];
    } | null;
    timestamp: number;
    finishedAt: number | null;
    error: string | null;
}

export default function AdmissionImportPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError, showInfo } = useNotification();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<ImportJobStatus | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
                showError('Only ZIP files are supported');
                return;
            }
            if (selectedFile.size > 50 * 1024 * 1024) {
                showError('ZIP file must be under 50MB');
                return;
            }
            setFile(selectedFile);
            setResults(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !resolvedBranchId) return;

        setIsUploading(true);
        setJobStatus(null);
        setResults(null);
        try {
            const data = await OnlineAdmissionService.importAdmissions(file, resolvedBranchId);
            if (data.jobId) {
                setJobId(data.jobId);
                setIsPolling(true);
                showInfo('Import job started. Processing in background...');
            } else {
                setResults(data);
                if (data.success > 0) {
                    showSuccess(`Successfully imported ${data.success} admissions`);
                }
                if (data.failed > 0) {
                    showError(`Failed to import ${data.failed} admissions`);
                }
            }
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') console.error('Import failed', error);
            showError(error.response?.data?.message || 'Import failed');
        } finally {
            setIsUploading(false);
        }
    };

    const pollJobStatus = async () => {
        if (!jobId) return;
        try {
            const response = await api.get(`/online-admissions/import/status/${jobId}`);
            const status: ImportJobStatus = response.data;
            setJobStatus(status);

            if (status.status === 'completed') {
                setIsPolling(false);
                setResults(status.result);
                if (status.result && status.result.success > 0) {
                    showSuccess(`Import completed: ${status.result.success} admissions imported`);
                }
                if (status.result && status.result.failed > 0) {
                    showError(`Import had ${status.result.failed} failures`);
                }
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            } else if (status.status === 'failed') {
                setIsPolling(false);
                showError(`Import failed: ${status.error || 'Unknown error'}`);
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Poll error', error);
        }
    };

    useEffect(() => {
        if (isPolling && jobId) {
            pollJobStatus();
            pollIntervalRef.current = setInterval(pollJobStatus, 2000);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [isPolling, jobId]);

    const downloadSample = () => {
        const anchor = document.createElement('a');
        anchor.href = '/admission-import-sample.csv';
        anchor.download = 'admission_import_sample.csv';
        anchor.click();
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Bulk Admission Import</h1>
                    <p className="text-foreground/60 font-medium mt-1">Import multiple admission applications with documents via ZIP file.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={downloadSample}
                    className="gap-2 rounded-xl h-12 border-primary/20 hover:bg-primary/5 transition-all"
                >
                    <Download className="h-4 w-4" /> Download Sample CSV
                </Button>
            </div>

            {/* Process Explanation */}
            <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden border-l-8 border-l-primary">
                <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        How It Works
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3 p-4 bg-muted/20 rounded-2xl">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                            <h4 className="font-semibold text-[12px]">Prepare Your CSV</h4>
                            <p className="text-[12px] text-foreground/60">Download the sample CSV template. Fill in all required fields (marked with *). Use exact values for enums: Gender (MALE/FEMALE), AdmissionType (NEW/TRANSFER), booleans (TRUE/FALSE).</p>
                        </div>
                        <div className="space-y-3 p-4 bg-muted/20 rounded-2xl">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                            <h4 className="font-semibold text-[12px]">Organize Documents</h4>
                            <p className="text-[12px] text-foreground/60">Create a <code className="bg-muted px-1 rounded">documents/</code> folder. Name files as <code className="bg-muted px-1 rounded">email_documenttype.ext</code>. Passport photos must be ≤200KB, exactly 300×300px, white background.</p>
                        </div>
                        <div className="space-y-3 p-4 bg-muted/20 rounded-2xl">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                            <h4 className="font-semibold text-[12px]">Zip & Upload</h4>
                            <p className="text-[12px] text-foreground/60">Compress the CSV and documents folder into a single ZIP file (max 50MB). Upload and the system will process everything in the background.</p>
                        </div>
                    </div>

                    {/* Document Naming Reference */}
                    <div className="p-4 bg-muted/10 rounded-2xl space-y-4">
                        <h4 className="font-semibold text-[12px] flex items-center gap-2">
                            <FileArchive className="h-4 w-4" />
                            ZIP File Structure
                        </h4>
                        <div className="bg-muted/30 rounded-xl p-4 font-mono text-[12px] space-y-1">
                            <p className="text-primary font-bold">admission_import.zip</p>
                            <p className="pl-4">├── admissions.csv</p>
                            <p className="pl-4">└── documents/</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_passport.jpg</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_birthcert.pdf</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_nin.pdf</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_schoolreport.pdf</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_medical.pdf</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_recommendation.pdf</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_transferletter.pdf</p>
                            <p className="pl-8 text-foreground/60">├── john@email.com_transfercert.pdf</p>
                            <p className="pl-8 text-foreground/60">└── john@email.com_payment.jpg</p>
                        </div>
                    </div>

                    {/* Document Type Mapping */}
                    <div className="p-4 bg-muted/10 rounded-2xl space-y-4">
                        <h4 className="font-semibold text-[12px] flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Document Type Keywords (used in filename)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { keyword: '_passport', maps: 'Passport Photograph', icon: <ImageIcon className="h-3 w-3" />, note: 'Must be ≤200KB, 300×300px, white background' },
                                { keyword: '_birthcert', maps: 'Birth Certificate', icon: <FileText className="h-3 w-3" />, note: '' },
                                { keyword: '_nin', maps: 'NIN Slip', icon: <FileText className="h-3 w-3" />, note: '' },
                                { keyword: '_schoolreport', maps: 'Last School Report', icon: <FileText className="h-3 w-3" />, note: '' },
                                { keyword: '_medical', maps: 'Medical Report', icon: <FileText className="h-3 w-3" />, note: '' },
                                { keyword: '_recommendation', maps: 'Recommendation Letter', icon: <FileText className="h-3 w-3" />, note: '' },
                                { keyword: '_transferletter', maps: 'Transfer Letter', icon: <FileText className="h-3 w-3" />, note: 'Required for TRANSFER admissions' },
                                { keyword: '_transfercert', maps: 'Transfer Certificate', icon: <FileText className="h-3 w-3" />, note: 'Required for TRANSFER admissions' },
                                { keyword: '_payment', maps: 'Payment Receipt', icon: <FileText className="h-3 w-3" />, note: '' },
                            ].map(item => (
                                <div key={item.keyword} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-primary/20">
                                    <code className="text-[12px] font-bold text-primary bg-primary/5 px-2 py-1 rounded shrink-0">{item.keyword}</code>
                                    <div>
                                        <p className="text-[12px] font-semibold">{item.maps}</p>
                                        {item.note && <p className="text-[10px] text-foreground/60">{item.note}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Passport Photo Requirements */}
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                        <h4 className="font-semibold text-[12px] flex items-center gap-2 text-amber-600">
                            <AlertCircle className="h-4 w-4" />
                            Passport Photo Requirements (Strict)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span className="text-[12px] font-medium">Maximum file size: <strong>200KB</strong></span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span className="text-[12px] font-medium">Exact dimensions: <strong>300×300 pixels</strong></span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span className="text-[12px] font-medium">Background: <strong>White or light-colored</strong></span>
                            </div>
                        </div>
                        <p className="text-[12px] text-foreground/60">Photos that fail validation will cause the entire row to be rejected. Ensure all passport photos meet these requirements before importing.</p>
                    </div>

                    {/* CSV Field Reference */}
                    <div className="p-4 bg-muted/10 rounded-2xl space-y-4">
                        <h4 className="font-semibold text-[12px] flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Required CSV Fields (marked with *)
                        </h4>
                        <div className="overflow-x-auto">
                            <table className={TABLE_ROOT}>
                                <thead>
                                    <tr className={TABLE_HEADER}>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Field</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Required</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Format / Values</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Example</th>
                                    </tr>
                                </thead>
                                <tbody className={TABLE_BODY}>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>FirstName</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>Text</td><td className={TABLE_CELL}><span className="font-mono">John</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>LastName</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>Text</td><td className={TABLE_CELL}><span className="font-mono">Doe</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>Gender</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>MALE or FEMALE</td><td className={TABLE_CELL}><span className="font-mono">MALE</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>DateOfBirth</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>YYYY-MM-DD</td><td className={TABLE_CELL}><span className="font-mono">2015-05-15</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>GuardianName</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>Text</td><td className={TABLE_CELL}><span className="font-mono">Robert Doe</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>GuardianPhone</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>Phone number</td><td className={TABLE_CELL}><span className="font-mono">08012345678</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>AdmissionType</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>NEW or TRANSFER</td><td className={TABLE_CELL}><span className="font-mono">NEW</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>AcademicSession</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>Session name (must exist)</td><td className={TABLE_CELL}><span className="font-mono">2024/2025</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>DesiredClass</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>Class name (must exist)</td><td className={TABLE_CELL}><span className="font-mono">Grade 5</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>BranchId</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>Branch UUID or name</td><td className={TABLE_CELL}><span className="font-mono">uuid or "Main Campus"</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>GuardianConsent</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>TRUE or FALSE</td><td className={TABLE_CELL}><span className="font-mono">TRUE</span></td></tr>
                                    <tr className={TABLE_ROW}><td className={TABLE_CELL_PRIMARY}>SchoolRulesAgreement</td><td className={TABLE_CELL}><span className="text-red-500">*</span></td><td className={TABLE_CELL}>TRUE or FALSE</td><td className={TABLE_CELL}><span className="font-mono">TRUE</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[12px] text-foreground/60">All other fields are optional. Leave blank if not applicable. Fields containing commas should be enclosed in double quotes.</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Instructions */}
                <Card className="lg:col-span-1 rounded-2xl border-primary/20 shadow-xl overflow-hidden self-start">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            Checklist
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-xs text-primary mt-0.5">1</div>
                                <p className="text-sm font-medium">Download the sample CSV template.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-xs text-primary mt-0.5">2</div>
                                <p className="text-sm font-medium">Fill in student details. <b>Required fields</b> are marked with * in the template.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-xs text-primary mt-0.5">3</div>
                                <p className="text-sm font-medium">Create a <code className="bg-muted px-1 rounded text-xs">documents/</code> folder with files named <code className="bg-muted px-1 rounded text-xs">email_type.ext</code>.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-xs text-primary mt-0.5">4</div>
                                <p className="text-sm font-medium">Ensure passport photos are ≤200KB, 300×300px, white background.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-xs text-primary mt-0.5">5</div>
                                <p className="text-sm font-medium">Zip the CSV + documents folder together (max 50MB).</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-xs text-primary mt-0.5">6</div>
                                <p className="text-sm font-medium">Upload the ZIP file and click <b>Start Import</b>.</p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Upload Section */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden border-t-8 border-t-primary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                                <Upload className="h-5 w-5 text-primary" />
                                Upload ZIP File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/50'
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files[0]) {
                                        const droppedFile = e.dataTransfer.files[0];
                                        if (!droppedFile.name.toLowerCase().endsWith('.zip')) {
                                            showError('Only ZIP files are supported');
                                            return;
                                        }
                                        setFile(droppedFile);
                                        setResults(null);
                                    }
                                }}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                                        <FileArchive className="h-8 w-8" />
                                    </div>
                                    {file ? (
                                        <div className="space-y-1">
                                            <p className="text-[14px] font-semibold">{file.name}</p>
                                            <p className="text-[12px] text-foreground/60 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-[14px] font-semibold">Click to browse or drag and drop</p>
                                            <p className="text-[12px] text-foreground/60 font-medium">Only .zip files supported (max 50MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept=".zip"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="zip-upload"
                                    />
                                    <label htmlFor="zip-upload">
                                        <Button asChild variant="secondary" className="rounded-xl h-12 px-8 font-bold cursor-pointer">
                                            <span>Select ZIP File</span>
                                        </Button>
                                    </label>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl font-semibold text-h3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                                disabled={!file || isUploading}
                                onClick={handleUpload}
                            >
                                {isUploading ? 'Importing Admissions...' : 'Start Bulk Import'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    {jobStatus && isPolling && (
                        <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden border-l-8 border-l-blue-500">
                            <CardHeader className="bg-blue-500/5 pb-4">
                                <CardTitle className="text-[14px] font-semibold flex items-center gap-2 text-blue-600">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing Import
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <Clock className="h-5 w-5 text-foreground/60" />
                                    <p className="text-[12px] font-medium">
                                        {jobStatus.status === 'active' ? 'Processing records...' :
                                         jobStatus.status === 'waiting' ? 'Waiting to start...' :
                                         'Processing...'}
                                    </p>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((jobStatus.progress || 0) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[12px] text-foreground/60">
                                    Started {new Date(jobStatus.timestamp).toLocaleTimeString()}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {results && !isPolling && (
                        <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-muted/50 pb-4">
                                <CardTitle className="text-[14px] font-semibold">Import Results</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-semibold uppercase tracking-tighter text-primary">Success</p>
                                            <p className="text-[14px] font-semibold">{results.success}</p>
                                        </div>
                                    </div>
                                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center text-destructive">
                                            <XCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-semibold uppercase tracking-tighter text-destructive">Failed</p>
                                            <p className="text-[14px] font-semibold">{results.failed}</p>
                                        </div>
                                    </div>
                                </div>

                                {(results.details?.length > 0 || results.parsingErrors?.length > 0) && (
                                    <div className="space-y-3">
                                        <p className="text-[12px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Details</p>
                                        <div className="rounded-2xl border border-primary/20 max-h-60 overflow-y-auto p-4 bg-muted/30 font-medium text-[12px] space-y-2">
                                            {results.parsingErrors?.map((err: string, i: number) => (
                                                <p key={i} className="text-amber-600 flex gap-2">
                                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {err}
                                                </p>
                                            ))}
                                            {results.details?.map((err: string, i: number) => (
                                                <p key={i} className={err.toLowerCase().includes('fail') || err.toLowerCase().includes('error') ? 'text-destructive flex gap-2' : 'text-emerald-600 flex gap-2'}>
                                                    {err.toLowerCase().includes('fail') || err.toLowerCase().includes('error') ? (
                                                        <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                                                    )}
                                                    {err}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            </div>
        </RequireBranch>
    );
}
