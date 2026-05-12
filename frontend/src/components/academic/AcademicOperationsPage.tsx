'use client';

import { GraduationCap, Table2, ShieldCheck, CheckCircle2, FileText, BarChart3 } from 'lucide-react';
import { ExamManagementUI } from './ExamManagementUI';
import { AssessmentComponentsUI } from './AssessmentComponentsUI';
import { ApprovalsUI } from './ApprovalsUI';
import { PublicationUI } from './PublicationUI';
import { TranscriptUI } from './TranscriptUI';
import { TahfeezUI } from './TahfeezUI';
import { AnalyticsUI } from './AnalyticsUI';
import { PortalUI } from './PortalUI';
import { ReportCardUI } from './ReportCardUI';
import { BroadsheetUI } from './BroadsheetUI';

type Mode = 'exams' | 'components' | 'approvals' | 'publication' | 'transcripts' | 'tahfeez' | 'analytics' | 'portal' | 'reportCards' | 'broadsheets';

const icons: Record<Mode, any> = {
    exams: GraduationCap,
    components: Table2,
    approvals: ShieldCheck,
    publication: CheckCircle2,
    transcripts: FileText,
    tahfeez: GraduationCap,
    analytics: BarChart3,
    portal: FileText,
    reportCards: FileText,
    broadsheets: Table2,
};

const titles: Record<Mode, string> = {
    exams: 'Exam Management',
    components: 'Assessment Components',
    approvals: 'Result Approvals',
    publication: 'Result Publication',
    transcripts: 'Transcripts',
    tahfeez: 'Tahfeez Assessment',
    analytics: 'Academic Analytics',
    portal: 'Academic Portal',
    reportCards: 'Report Cards',
    broadsheets: 'Broadsheets',
};

const subtitles: Record<Mode, string> = {
    exams: 'Create and manage examinations across classes and sections.',
    components: 'Configure assessment components with weights and maximum scores.',
    approvals: 'Submit and track result approvals with computation support.',
    publication: 'Publish computed results to student and parent portals.',
    transcripts: 'Generate branded transcripts with QR verification codes.',
    tahfeez: 'Track Quran memorization progress with weighted scoring.',
    analytics: 'Visualize academic performance with charts and grade distribution.',
    portal: 'View student academic results, subject scores, and performance charts.',
    reportCards: 'Generate printable report cards with GPA, grades, and attendance.',
    broadsheets: 'Export class broadsheets with all student results in PDF format.',
};

export function AcademicOperationsPage({ mode }: { mode: Mode }) {
    const Icon = icons[mode];

    const componentMap: Record<Mode, React.ComponentType> = {
        exams: ExamManagementUI,
        components: AssessmentComponentsUI,
        approvals: ApprovalsUI,
        publication: PublicationUI,
        transcripts: TranscriptUI,
        tahfeez: TahfeezUI,
        analytics: AnalyticsUI,
        portal: PortalUI,
        reportCards: ReportCardUI,
        broadsheets: BroadsheetUI,
    };

    const Component = componentMap[mode];

    return (
        <main className="mx-auto max-w-7xl space-y-6 p-4 pb-16 md:p-8">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">{titles[mode]}</h1>
                        <p className="text-sm text-muted-foreground">{subtitles[mode]}</p>
                    </div>
                </div>
            </header>

            <Component />
        </main>
    );
}
