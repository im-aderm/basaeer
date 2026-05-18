'use client';

import { useAuth } from '@/context/AuthContext';

export default function ContextRefreshWrapper({ children }: { children: React.ReactNode }) {
    const { refreshKey } = useAuth();
    return <div key={refreshKey}>{children}</div>;
}
