"use client";

import { useState, useEffect } from "react";
import { Video, Upload, CheckCircle2, XCircle, Settings, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/lib/api";

export default function LiveClassesSettingsPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [formData, setFormData] = useState({
        serviceAccountJson: "",
        projectId: "",
        clientEmail: "",
        defaultDuration: 60,
        autoRecording: false,
        requireApproval: true,
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get("/live-classes/config");
            if (response.data) {
                setConfig(response.data);
                setFormData({
                    serviceAccountJson: "",
                    projectId: response.data.projectId || "",
                    clientEmail: response.data.clientEmail || "",
                    defaultDuration: response.data.defaultDuration || 60,
                    autoRecording: response.data.autoRecording || false,
                    requireApproval: response.data.requireApproval || true,
                });
            }
        } catch (error) {
            // Config doesn't exist yet, that's okay
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text);
            setFormData({
                ...formData,
                serviceAccountJson: text,
                projectId: json.project_id || "",
                clientEmail: json.client_email || "",
            });
            toast.success("Service account file loaded successfully!");
        } catch (error) {
            toast.error("Invalid JSON file");
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            await api.post("/live-classes/config/test", {
                serviceAccountJson: formData.serviceAccountJson,
            });
            toast.success("Connection successful! Google Meet is configured correctly.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Connection failed");
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        try {
            if (config) {
                await api.patch("/live-classes/config", formData);
                toast.success("Configuration updated successfully!");
            } else {
                await api.post("/live-classes/config", formData);
                toast.success("Configuration created successfully!");
            }
            fetchConfig();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save configuration");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-h1 font-bold tracking-tight text-primary">
                    Google Meet Configuration
                </h1>
                <p className="text-slate-600 mt-2">
                    Configure Google Meet integration for live classroom sessions
                </p>
            </div>

            {/* Status Card */}
            {config && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Google Meet Configured</h3>
                                <p className="text-sm text-slate-600">
                                    Project: {config.projectId}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleTestConnection}
                            disabled={testing}
                        >
                            {testing ? "Testing..." : "Test Connection"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Configuration Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 mb-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Google Cloud Credentials
                </h2>

                <div className="space-y-6">
                    {/* File Upload */}
                    <div>
                        <Label htmlFor="serviceAccountFile">Service Account JSON File</Label>
                        <div className="mt-2">
                            <label
                                htmlFor="serviceAccountFile"
                                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                            >
                                <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                    <p className="text-sm font-medium text-slate-700">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">JSON file from Google Cloud Console</p>
                                </div>
                                <input
                                    id="serviceAccountFile"
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Or paste JSON */}
                    <div>
                        <Label htmlFor="serviceAccountJson">Or Paste Service Account JSON</Label>
                        <Textarea
                            id="serviceAccountJson"
                            value={formData.serviceAccountJson}
                            onChange={(e) =>
                                setFormData({ ...formData, serviceAccountJson: e.target.value })
                            }
                            rows={8}
                            placeholder='{"type": "service_account", "project_id": "...", ...}'
                            className="font-mono text-xs"
                        />
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="projectId">Project ID</Label>
                            <Input
                                id="projectId"
                                value={formData.projectId}
                                onChange={(e) =>
                                    setFormData({ ...formData, projectId: e.target.value })
                                }
                                placeholder="your-project-id"
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="clientEmail">Client Email</Label>
                            <Input
                                id="clientEmail"
                                value={formData.clientEmail}
                                onChange={(e) =>
                                    setFormData({ ...formData, clientEmail: e.target.value })
                                }
                                placeholder="service-account@project.iam.gserviceaccount.com"
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting Settings */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 mb-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Default Meeting Settings
                </h2>

                <div className="space-y-6">
                    <div>
                        <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
                        <Input
                            id="defaultDuration"
                            type="number"
                            min="15"
                            max="480"
                            value={formData.defaultDuration}
                            onChange={(e) =>
                                setFormData({ ...formData, defaultDuration: parseInt(e.target.value) })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="autoRecording">Automatic Recording</Label>
                            <p className="text-sm text-slate-500">
                                Automatically record all meetings
                            </p>
                        </div>
                        <Switch
                            id="autoRecording"
                            checked={formData.autoRecording}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, autoRecording: checked })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="requireApproval">Require Approval</Label>
                            <p className="text-sm text-slate-500">
                                Students need approval to join meetings
                            </p>
                        </div>
                        <Switch
                            id="requireApproval"
                            checked={formData.requireApproval}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, requireApproval: checked })
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">
                    Setup Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                    <li>Go to Google Cloud Console and create a new project</li>
                    <li>Enable the Google Calendar API for your project</li>
                    <li>Create a service account and download the JSON key file</li>
                    <li>Upload the JSON file or paste its contents above</li>
                    <li>Test the connection to verify everything is working</li>
                    <li>Configure default meeting settings as needed</li>
                </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={!formData.serviceAccountJson || testing}
                >
                    {testing ? "Testing..." : "Test Connection"}
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!formData.serviceAccountJson}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                    Save Configuration
                </Button>
            </div>
        </div>
    );
}
