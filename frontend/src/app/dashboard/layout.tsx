import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import BranchGuardProvider from "@/components/BranchGuardProvider";
import { QueryProvider } from "@/providers/QueryProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <QueryProvider>
                <BranchGuardProvider>
                    <div className="flex h-screen bg-background text-foreground overflow-hidden">
                        <Sidebar />
                        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
                            <Header />
                            <main className="flex-1 overflow-auto bg-muted/20 custom-scrollbar p-6">
                                {children}
                            </main>
                        </div>
                    </div>
                </BranchGuardProvider>
            </QueryProvider>
        </ProtectedRoute>
    );
}
