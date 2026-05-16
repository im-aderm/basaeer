"use client";

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
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "PENDING":
                return <Clock className="w-4 h-4 text-amber-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-2">
                        <FileBarChart className="w-6 h-6 text-primary" />
                        Communication Reports
                    </h1>
                    <p className="text-gray-500">Track and monitor your SMS and Email campaigns.</p>
                </div>
                <button 
                    onClick={fetchCampaigns}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-primary/90 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-primary/90 bg-white/75 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="rounded-xl border border-primary/90 bg-white/75 focus:ring-primary focus:border-primary"
                        >
                            <option value="ALL">All Types</option>
                            <option value="EMAIL">Email Only</option>
                            <option value="SMS">SMS Only</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipients</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4" colSpan={6}>
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredCampaigns.length > 0 ? (
                                filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{campaign.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {campaign.type === 'EMAIL' ? (
                                                    <Mail className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <Smartphone className="w-4 h-4 text-green-500" />
                                                )}
                                                <span className="text-sm text-gray-600">{campaign.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(campaign.status)}
                                                <span className="text-sm capitalize text-gray-600">{campaign.status.toLowerCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {campaign.recipientCount || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(new Date(campaign.createdAt), 'MMM dd, yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary hover:text-primary/80 text-sm font-medium">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No campaigns found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <div>Showing {filteredCampaigns.length} campaigns</div>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 border border-primary/90 rounded disabled:opacity-50">Prev</button>
                        <button disabled className="px-3 py-1 border border-primary/90 rounded disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
