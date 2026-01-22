'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, AlertCircle, CheckCircle2, XCircle, FileSpreadsheet } from 'lucide-react';
import { StudentService } from '@/services/studentService';
import { toast } from 'sonner';
import * as ExcelJS from 'exceljs';

export default function BulkImportPage() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !user?.branchId) return;

        setIsUploading(true);
        try {
            const data = await StudentService.importStudents(file, user.branchId);
            setResults(data);
            if (data.success > 0) {
                toast.success(`Successfully imported ${data.success} students`);
            }
            if (data.failed > 0) {
                toast.error(`Failed to import ${data.failed} students`);
            }
        } catch (error: any) {
            console.error('Import failed', error);
            toast.error(error.response?.data?.message || 'Import failed');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadSample = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Students');

        worksheet.columns = [
            { header: 'First Name *', key: 'firstName', width: 20 },
            { header: 'Last Name *', key: 'lastName', width: 20 },
            { header: 'Gender (MALE/FEMALE) *', key: 'gender', width: 15 },
            { header: 'DOB (YYYY-MM-DD) *', key: 'dob', width: 15 },
            { header: 'Class (Name or ID) *', key: 'className', width: 20 },
            { header: 'Academic Session (Name or ID) *', key: 'sessionName', width: 25 },
            { header: 'Guardian Name *', key: 'guardianName', width: 20 },
            { header: 'Guardian Phone *', key: 'guardianPhone', width: 20 },
            { header: 'Home Address', key: 'address', width: 30 },
        ];

        worksheet.addRow(['John', 'Doe', 'MALE', '2015-05-15', 'Grade 1', '2023/2024 Session', 'Robert Doe', '08012345678', '123 School Road, City']);
        worksheet.addRow(['Jane', 'Smith', 'FEMALE', '2016-08-20', 'Grade 2', '2023/2024 Session', 'Mary Smith', '08098765432', '456 Academy Ave, State']);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'student_import_sample.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic">Bulk Student Import</h1>
                    <p className="text-muted-foreground font-medium mt-1">Enroll multiple students at once using an Excel file.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={downloadSample}
                    className="gap-2 rounded-xl h-12 border-primary/20 hover:bg-primary/5 transition-all"
                >
                    <Download className="h-4 w-4" /> Download Sample
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Instructions */}
                <Card className="lg:col-span-1 rounded-[2rem] border-border/50 shadow-xl overflow-hidden self-start">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-xl font-black italic flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-black text-xs text-primary mt-0.5">1</div>
                                <p className="text-sm font-medium">Download the sample Excel template using the button above.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-black text-xs text-primary mt-0.5">2</div>
                                <p className="text-sm font-medium">Fill in the student details. <b>Email, First Name,</b> and <b>Last Name</b> are required.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-black text-xs text-primary mt-0.5">3</div>
                                <p className="text-sm font-medium">Ensure the date format for DOB is <b>YYYY-MM-DD</b>.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-black text-xs text-primary mt-0.5">4</div>
                                <p className="text-sm font-medium">Upload the file and click <b>Start Import</b>.</p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Upload Section */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-primary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-black italic flex items-center gap-2">
                                <Upload className="h-5 w-5 text-primary" />
                                Upload File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${file ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'
                                    }`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files[0]) {
                                        setFile(e.dataTransfer.files[0]);
                                        setResults(null);
                                    }
                                }}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet className="h-8 w-8" />
                                    </div>
                                    {file ? (
                                        <div className="space-y-1">
                                            <p className="text-lg font-black italic">{file.name}</p>
                                            <p className="text-sm text-muted-foreground font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-lg font-black italic">Click to browse or drag and drop</p>
                                            <p className="text-sm text-muted-foreground font-medium">Only .xlsx and .csv files supported</p>
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        accept=".xlsx,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload">
                                        <Button asChild variant="secondary" className="rounded-xl h-12 px-8 font-bold cursor-pointer">
                                            <span>Select File</span>
                                        </Button>
                                    </label>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
                                disabled={!file || isUploading}
                                onClick={handleUpload}
                            >
                                {isUploading ? 'Importing Students...' : 'Start Bulk Import'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    {results && (
                        <Card className="rounded-[2rem] border-border/50 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-muted/50 pb-4">
                                <CardTitle className="text-xl font-black italic">Import Results</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[1.5rem] flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tighter text-emerald-600">Success</p>
                                            <p className="text-2xl font-black">{results.success}</p>
                                        </div>
                                    </div>
                                    <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-[1.5rem] flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive">
                                            <XCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tighter text-destructive">Failed</p>
                                            <p className="text-2xl font-black">{results.failed}</p>
                                        </div>
                                    </div>
                                </div>

                                {(results.details.length > 0 || results.parsingErrors.length > 0) && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Issues Found</p>
                                        <div className="rounded-[1.5rem] border border-border/50 max-h-60 overflow-y-auto p-4 bg-muted/30 font-medium text-sm space-y-2">
                                            {results.parsingErrors.map((err: string, i: number) => (
                                                <p key={i} className="text-amber-600 flex gap-2">
                                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {err}
                                                </p>
                                            ))}
                                            {results.details.map((err: string, i: number) => (
                                                <p key={i} className="text-destructive flex gap-2">
                                                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" /> {err}
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
    );
}
