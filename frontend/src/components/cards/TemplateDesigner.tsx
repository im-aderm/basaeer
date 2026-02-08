"use client";

import { useState, useRef, useEffect } from "react";
import {
    X,
    Save,
    Type,
    User,
    Image as ImageIcon,
    Move,
    Plus,
    Minus,
    Palette,
    Loader2,
    Trash2,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardService, IdCardTemplate } from "@/services/cardService";

interface FieldConfig {
    x: number;
    y: number;
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    width?: number;
    height?: number;
    label?: string;
}

interface TemplateConfig {
    fields: Record<string, FieldConfig>;
}

export default function TemplateDesigner({
    template,
    onClose
}: {
    template: IdCardTemplate;
    onClose: () => void;
}) {
    const [config, setConfig] = useState<TemplateConfig>(
        template.config || { fields: {} }
    );
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [draggingField, setDraggingField] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [saving, setSaving] = useState(false);

    const availableFields = [
        { id: "name", label: "Full Name", icon: Type },
        { id: "id", label: "Student ID", icon: Type },
        { id: "class", label: "Class & Section", icon: Type },
        { id: "branch", label: "Branch Name", icon: Type },
        { id: "session", label: "Academic Session", icon: Type },
        { id: "photo", label: "Student Photo", icon: User },
        { id: "logo", label: "School Logo", icon: ImageIcon },
    ];

    const addField = (fieldId: string) => {
        if (config.fields[fieldId]) return;

        const isPhoto = fieldId === "photo" || fieldId === "logo";
        setConfig({
            ...config,
            fields: {
                ...config.fields,
                [fieldId]: {
                    x: 50,
                    y: 50,
                    ...(isPhoto ? { width: 80, height: 80 } : { fontSize: 14, color: "#000000", fontWeight: "normal" }),
                    label: availableFields.find(f => f.id === fieldId)?.label
                }
            }
        });
        setSelectedField(fieldId);
    };

    const removeField = (fieldId: string) => {
        const newFields = { ...config.fields };
        delete newFields[fieldId];
        setConfig({ ...config, fields: newFields });
        if (selectedField === fieldId) setSelectedField(null);
    };

    const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
        setDraggingField(fieldId);
        setSelectedField(fieldId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingField || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Constraint within bounds
        const constrainedX = Math.max(0, Math.min(x, rect.width));
        const constrainedY = Math.max(0, Math.min(y, rect.height));

        setConfig({
            ...config,
            fields: {
                ...config.fields,
                [draggingField]: {
                    ...config.fields[draggingField],
                    x: constrainedX,
                    y: constrainedY
                }
            }
        });
    };

    const handleMouseUp = () => {
        setDraggingField(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await CardService.updateTemplate(template.id, { config });
            onClose();
        } catch (error) {
            console.error("Failed to save template:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Palette size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tight">{template.name}</h2>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Visual Template Designer</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={onClose}>
                        <X size={20} className="mr-2" /> Cancel
                    </Button>
                    <Button
                        className="bg-primary text-white font-black px-8 rounded-xl h-11"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                        Save Layout
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Fields */}
                <div className="w-80 border-r border-white/10 p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Available Fields</h3>
                        <div className="space-y-3">
                            {availableFields.map(field => (
                                <button
                                    key={field.id}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${config.fields[field.id]
                                        ? "border-primary bg-primary/10 text-primary cursor-default"
                                        : "border-white/5 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
                                        }`}
                                    onClick={() => addField(field.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <field.icon size={18} />
                                        <span className="font-bold">{field.label}</span>
                                    </div>
                                    {!config.fields[field.id] && <Plus size={16} className="opacity-0 group-hover:opacity-100" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedField && (
                        <div className="space-y-6 pt-6 border-t border-white/10 animate-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Field Properties: {selectedField}</h3>
                            <div className="space-y-4">
                                {selectedField !== 'photo' && selectedField !== 'logo' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/60 uppercase">Font Size</label>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    size="icon" variant="outline" className="w-8 h-8 rounded-lg border-white/10 hover:bg-white/10"
                                                    onClick={() => setConfig({
                                                        ...config,
                                                        fields: {
                                                            ...config.fields,
                                                            [selectedField]: { ...config.fields[selectedField], fontSize: (config.fields[selectedField].fontSize || 14) - 1 }
                                                        }
                                                    })}
                                                >
                                                    <Minus size={14} />
                                                </Button>
                                                <span className="text-white font-bold w-8 text-center">{config.fields[selectedField].fontSize || 14}</span>
                                                <Button
                                                    size="icon" variant="outline" className="w-8 h-8 rounded-lg border-white/10 hover:bg-white/10"
                                                    onClick={() => setConfig({
                                                        ...config,
                                                        fields: {
                                                            ...config.fields,
                                                            [selectedField]: { ...config.fields[selectedField], fontSize: (config.fields[selectedField].fontSize || 14) + 1 }
                                                        }
                                                    })}
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/60 uppercase">Text Color</label>
                                            <input
                                                type="color"
                                                className="w-full h-10 rounded-lg bg-transparent cursor-pointer"
                                                value={config.fields[selectedField].color || "#000000"}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    fields: {
                                                        ...config.fields,
                                                        [selectedField]: { ...config.fields[selectedField], color: e.target.value }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/60 uppercase">Size (px)</label>
                                            <input
                                                type="range" min="20" max="300"
                                                className="w-full"
                                                value={config.fields[selectedField].width || 80}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    fields: {
                                                        ...config.fields,
                                                        [selectedField]: {
                                                            ...config.fields[selectedField],
                                                            width: parseInt(e.target.value),
                                                            height: parseInt(e.target.value)
                                                        }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="destructive"
                                    className="w-full rounded-xl gap-2 mt-4"
                                    onClick={() => removeField(selectedField)}
                                >
                                    <Trash2 size={16} /> Remove Field
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Designer Canvas */}
                <div
                    className="flex-1 bg-white/5 flex items-center justify-center p-20 overflow-auto"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        ref={containerRef}
                        className="relative bg-white shadow-2xl overflow-hidden select-none"
                        style={{
                            width: '320px',
                            height: '500px',
                            backgroundImage: `url(${template.backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {!template.backgroundImage && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/10 pointer-events-none">
                                <CreditCard size={120} />
                                <span className="text-xl font-black italic mt-4 uppercase tracking-[0.2em]">Background Area</span>
                            </div>
                        )}

                        {Object.entries(config.fields).map(([id, field]) => {
                            const isPhoto = id === 'photo' || id === 'logo';
                            return (
                                <div
                                    key={id}
                                    style={{
                                        position: 'absolute',
                                        left: `${field.x}px`,
                                        top: `${field.y}px`,
                                        cursor: 'move',
                                        zIndex: selectedField === id ? 50 : 10,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    className={`group transition-shadow ${selectedField === id ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                    onMouseDown={(e) => handleMouseDown(e, id)}
                                >
                                    {isPhoto ? (
                                        <div
                                            style={{
                                                width: `${field.width}px`,
                                                height: `${field.height}px`,
                                                backgroundColor: '#f3f4f6',
                                                border: '2px dashed #d1d5db',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#9ca3af'
                                            }}
                                            className="rounded-lg shadow-sm"
                                        >
                                            {id === 'photo' ? <User size={field.width! / 2} /> : <ImageIcon size={field.width! / 2} />}
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: `${field.fontSize}px`,
                                                color: field.color,
                                                fontWeight: field.fontWeight || 'normal',
                                                whiteSpace: 'nowrap',
                                                padding: '4px 8px',
                                                backgroundColor: selectedField === id ? 'rgba(255,255,255,0.8)' : 'transparent',
                                                borderRadius: '4px'
                                            }}
                                            className="shadow-sm"
                                        >
                                            {field.label}
                                        </div>
                                    )}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[8px] font-bold px-2 py-1 rounded pointer-events-none uppercase tracking-widest">
                                        Drag to Position
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
