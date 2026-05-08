"use client";

import { useState } from "react";
import { LayoutGrid, Plus, Trash2, Edit2, Settings2, Database, UserSquare2, GraduationCap } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Modal } from "@/components/Modal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CustomField {
    id: string;
    name: string;
    entity: 'Student' | 'Staff' | 'Expense';
    type: 'Text' | 'Number' | 'Date' | 'Dropdown';
    required: boolean;
    defaultValue?: string;
}

const initialFields: CustomField[] = [
    { id: '1', name: 'Alumni ID', entity: 'Student', type: 'Text', required: false },
    { id: '2', name: 'Contract Type', entity: 'Staff', type: 'Dropdown', required: true, defaultValue: 'Full-time' },
    { id: '3', name: 'Project Code', entity: 'Expense', type: 'Text', required: false },
    { id: '4', name: 'Emergency Contact Relation', entity: 'Student', type: 'Text', required: true }
];

export default function CustomFieldsPage() {
    const [fields, setFields] = useState<CustomField[]>(initialFields);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomField | null>(null);

    const [formData, setFormData] = useState<Partial<CustomField>>({
        name: '',
        entity: 'Student',
        type: 'Text',
        required: false
    });

    const handleCreate = () => {
        setEditingField(null);
        setFormData({ name: '', entity: 'Student', type: 'Text', required: false });
        setIsModalOpen(true);
    };

    const handleEdit = (field: CustomField) => {
        setEditingField(field);
        setFormData(field);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
        toast.success("Field deleted successfully");
    };

    const handleSave = () => {
        if (!formData.name) {
            toast.error("Field name is required");
            return;
        }

        if (editingField) {
            setFields(prev => prev.map(f => f.id === editingField.id ? { ...f, ...formData } as CustomField : f));
            toast.success("Field updated successfully");
        } else {
            const newField: CustomField = {
                id: Math.random().toString(36).substr(2, 9),
                name: formData.name!,
                entity: formData.entity as any,
                type: formData.type as any,
                required: formData.required || false,
                defaultValue: formData.defaultValue
            };
            setFields(prev => [...prev, newField]);
            toast.success("New field created successfully");
        }
        setIsModalOpen(false);
    };

    const columns = [
        {
            header: "Field Name",
            accessor: (field: CustomField) => (
                <div className="font-semibold text-foreground">{field.name}</div>
            )
        },
        {
            header: "Entity",
            accessor: (field: CustomField) => (
                <div className="flex items-center gap-2">
                    {field.entity === 'Student' && <GraduationCap className="h-4 w-4 text-primary" />}
                    {field.entity === 'Staff' && <UserSquare2 className="h-4 w-4 text-emerald-500" />}
                    {field.entity === 'Expense' && <Database className="h-4 w-4 text-amber-500" />}
                    <span className="font-medium">{field.entity}</span>
                </div>
            )
        },
        {
            header: "Type",
            accessor: (field: CustomField) => (
                <Badge variant="outline" className="rounded-lg capitalize">{field.type.toLowerCase()}</Badge>
            )
        },
        {
            header: "Required",
            accessor: (field: CustomField) => (
                <Badge variant={field.required ? "default" : "secondary"} className="rounded-lg">
                    {field.required ? "Yes" : "No"}
                </Badge>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">Custom Fields</h1>
                    <p className="text-muted-foreground font-medium mt-1">Add additional data points to students, staff, and other entities.</p>
                </div>
                <Button 
                    onClick={handleCreate}
                    className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Create New Field
                </Button>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Settings2 className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-semibold">Configured Fields</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable 
                        columns={columns} 
                        data={fields}
                        actions={(field) => (
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(field)} className="hover:text-primary">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(field.id)} className="hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingField ? "Edit Custom Field" : "Create New Custom Field"}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Field Name</Label>
                        <Input 
                            placeholder="e.g. Blood Group" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Target Entity</Label>
                            <Select 
                                value={formData.entity} 
                                onValueChange={(v) => setFormData(prev => ({ ...prev, entity: v as any }))}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Student">Student</SelectItem>
                                    <SelectItem value="Staff">Staff</SelectItem>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Field Type</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as any }))}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Text">Text</SelectItem>
                                    <SelectItem value="Number">Number</SelectItem>
                                    <SelectItem value="Date">Date</SelectItem>
                                    <SelectItem value="Dropdown">Dropdown</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Default Value (Optional)</Label>
                        <Input 
                            placeholder="e.g. N/A" 
                            value={formData.defaultValue || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="required" 
                            checked={formData.required}
                            onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <Label htmlFor="required" className="cursor-pointer">Mark as Required</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="rounded-xl px-8">
                            {editingField ? "Update Field" : "Create Field"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
