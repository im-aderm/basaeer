"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QRReportsRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/dashboard/reports/attendance');
    }, [router]);

    return null;
}
