"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from "react";
import { 
    FileBarChart, 
    RefreshCcw, 
    Mail, 
    Smartphone, 
    CheckCircle, 
    Clock, 
    AlertTriangle,
    Search,
    Filter
} from "lucide-react";
import { commsService, Campaign } from "@/services/commsService";
import { format } from "date-fns";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from "@/lib/table-styles";
export default function CommsReportPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL");

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await commsService.getCampaigns();
            if (response.data) {
                setCampaigns(response.data);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const filteredCampaigns = (campaigns ?? []).filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "ALL" || c.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="w-4 h-4 text-primary" />;
            case "PENDING":
                return <Clock className="w-4 h-4 text-amber-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="p-4">
                <BranchContextBanner />
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileBarChart className="w-5 h-5 text-primary" />
                        Communication Reports
                    </h1>
                    <p className="text-foreground/60 text-[12px]">Track and monitor your SMS and Email campaigns.</p>
                </div>
                <button
                    onClick={fetchCampaigns}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-primary/90 rounded-lg text-foreground/60 hover:bg-gray-50 transition-colors text-[12px]"
                >
                    <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-primary/20 overflow-hidden">
                {/* Filters */}
                <div className="p-3 border-b border-primary/20 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/60" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-primary/90 bg-white/75 focus:ring-primary focus:border-primary text-[12px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3 text-foreground/60" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="rounded-xl border border-primary/90 bg-white/75 focus:ring-primary focus:border-primary text-[12px]"
                        >
                            <option value="ALL">All Types</option>
                            <option value="EMAIL">Email Only</option>
                            <option value="SMS">SMS Only</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className={TABLE_ROOT}>
                        <thead className={TABLE_HEADER}>
                            <tr>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Campaign Name</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Type</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Recipients</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Date</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={TABLE_BODY}>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-3 py-1.5" colSpan={6}>
                                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCampaigns.length > 0 ? (
                                filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>
                                            {campaign.name}
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex items-center gap-2">
                                                {campaign.type === 'EMAIL' ? (
                                                    <Mail className="w-3 h-3 text-blue-500" />
                                                ) : (
                                                    <Smartphone className="w-3 h-3 text-primary" />
                                                )}
                                                <span className="text-[12px] text-foreground/60">{campaign.type}</span>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(campaign.status)}
                                                <span className="text-[12px] capitalize text-foreground/60">{campaign.status.toLowerCase()}</span>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            {campaign.recipientCount || 0}
                                        </td>
                                        <td className={TABLE_CELL}>
                                            {format(new Date(campaign.createdAt), 'MMM dd, yyyy HH:mm')}
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <button className="text-primary hover:text-primary/80 text-[12px] font-medium">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-3 py-8 text-center text-foreground/60 text-[12px]">
                                        No campaigns found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-3 py-3 border-t border-primary/20 flex items-center justify-between text-[12px] text-foreground/60">
                    <div>Showing {filteredCampaigns.length} campaigns</div>
                    <div className="flex gap-2">
                        <button disabled className="px-2 py-1 border border-primary/90 rounded disabled:opacity-50 text-[12px]">Prev</button>
                        <button disabled className="px-2 py-1 border border-primary/90 rounded disabled:opacity-50 text-[12px]">Next</button>
                    </div>
                </div>
            </div>
        </div>
    </RequireBranch>
    );
}
