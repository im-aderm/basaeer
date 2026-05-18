import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import BranchGuardProvider from "@/components/BranchGuardProvider";
import SessionGuardProvider from "@/components/SessionGuardProvider";
import RequireBranch from "@/components/RequireBranch";
import RequireSession from "@/components/RequireSession";
import ContextRefreshWrapper from "@/components/ContextRefreshWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <QueryProvider>
                <BranchGuardProvider>
                    <SessionGuardProvider>
                        <RequireBranch>
                            <RequireSession>
                                <ContextRefreshWrapper>
                                    <div className="flex h-screen bg-background text-foreground overflow-hidden">
                                        <Sidebar />
                                        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
                                            <Header />
                                            <main className="flex-1 overflow-auto bg-muted/20 custom-scrollbar p-6">
                                                {children}
                                            </main>
                                        </div>
                                    </div>
                                    <Toaster position="top-center" richColors />
                                </ContextRefreshWrapper>
                            </RequireSession>
                        </RequireBranch>
                    </SessionGuardProvider>
                </BranchGuardProvider>
            </QueryProvider>
        </ProtectedRoute>
    );
}
