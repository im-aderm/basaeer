"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Plus,
    Bed,
    User,
    Clock,
    LogOut,
    Settings,
    Loader2,
    Search,
    UserPlus,
    Home,
    MoreVertical,
    Edit2,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotification } from '@/context/NotificationContext';
import { HostelService, Hostel, Room, Bed as BedType } from "@/services/hostelService";
import { StudentService } from "@/services/studentService";

function ManageRoomsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showSuccess, showError, showInfo } = useNotification();
    const hostelId = searchParams.get("id");

    const [hostel, setHostel] = useState<Hostel | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentSearch, setStudentSearch] = useState("");

    // Modal states
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [isDeleteRoomOpen, setIsDeleteRoomOpen] = useState(false);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

    // Form states
    const [roomForm, setRoomForm] = useState({
        id: "",
        number: "",
        floor: 1,
        capacity: 4
    });

    const [selectedBed, setSelectedBed] = useState<BedType | null>(null);
    const [checkInData, setCheckInData] = useState({
        studentId: "",
        checkInDate: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        if (!hostelId) return;
        try {
            const [hostelData, studentsData] = await Promise.all([
                HostelService.getById(hostelId),
                StudentService.getAll()
            ]);
            setHostel(hostelData);
            setStudents(studentsData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Fetch failed:", error);
            showError("Failed to load building data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [hostelId]);

    const handleRoomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (roomForm.id) {
                await HostelService.updateRoom(roomForm.id, roomForm);
                showSuccess("Room updated successfully");
            } else {
                await HostelService.createRoom({ ...roomForm, hostelId: hostelId as string });
                showSuccess("Room added successfully");
            }
            setIsRoomModalOpen(false);
            setRoomForm({ id: "", number: "", floor: 1, capacity: 4 });
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Room operation failed:", error);
            showError("Failed to perform room operation");
        }
    };

    const handleDeleteRoom = async () => {
        if (!roomForm.id) return;
        try {
            await HostelService.deleteRoom(roomForm.id);
            showSuccess("Room deleted successfully");
            setIsDeleteRoomOpen(false);
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Delete room failed:", error);
            showError("Failed to delete room");
        }
    };

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBed) return;
        try {
            await HostelService.allocateBed({
                ...checkInData,
                bedId: selectedBed.id
            });
            showSuccess("Student assigned to bed");
            setIsCheckInOpen(false);
            setCheckInData({ studentId: "", checkInDate: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Check-in failed:", error);
            showError("Failed to allocate bed");
        }
    };

    const handleCheckOut = async () => {
        if (!selectedBed?.allocations?.[0]?.id) return;
        try {
            await HostelService.releaseBed(selectedBed.allocations[0].id);
            showSuccess("Bed released successfully");
            setIsCheckOutOpen(false);
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Check-out failed:", error);
            showError("Failed to process check-out");
        }
    };

    const openEditRoom = (room: Room) => {
        setRoomForm({
            id: room.id,
            number: room.number,
            floor: room.floor,
            capacity: room.capacity
        });
        setIsRoomModalOpen(true);
    };

    const openDeleteRoom = (room: Room) => {
        setRoomForm({ ...roomForm, id: room.id, number: room.number });
        setIsDeleteRoomOpen(true);
    };

    const filteredStudents = (students ?? []).filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(studentSearch.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    if (!hostel) return <div className="p-4 text-center text-red-500 font-semibold text-[12px]">Building not found or access denied.</div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <BranchContextBanner />
                {/* Nav Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl h-10 w-10 border border-primary/20 hover:bg-muted"
                    >
                        <ChevronLeft size={18} strokeWidth={2} />
                    </Button>
                    <div>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary">{hostel.name}</h1>
                        <p className="text-foreground/60 font-semibold uppercase tracking-wide text-[11px] mt-0.5">Management • {hostel.type}</p>
                    </div>
                </div>

                <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => setRoomForm({ id: "", number: "", floor: 1, capacity: 4 })}
                            className="h-10 px-5 rounded-xl bg-primary text-white font-semibold text-[12px] gap-2 shadow-md shadow-primary/20"
                        >
                            <Plus size={16} /> Add Room
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-[14px] font-semibold">{roomForm.id ? 'Edit Room' : 'Create New Room'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRoomSubmit} className="space-y-4 pt-4">
                            <div className="space-y-1.5">
                                <Label className="font-semibold text-[12px] ml-1">Room Number / ID</Label>
                                <Input
                                    required
                                    className="rounded-xl h-10 text-[12px]"
                                    placeholder="e.g. 101, B-42"
                                    value={roomForm.number}
                                    onChange={e => setRoomForm({ ...roomForm, number: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-[12px] ml-1">Floor</Label>
                                    <Input
                                        type="number"
                                        required
                                        min={0}
                                        className="rounded-xl h-10 text-[12px]"
                                        value={roomForm.floor}
                                        onChange={e => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-[12px] ml-1">Bed Capacity</Label>
                                    <Input
                                        type="number"
                                        required
                                        min={1}
                                        className="rounded-xl h-10 text-[12px]"
                                        value={roomForm.capacity}
                                        readOnly={!!roomForm.id}
                                        onChange={e => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                                    />
                                    {roomForm.id && <p className="text-[10px] text-foreground/50 ml-1">Capacity cannot be changed after creation</p>}
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-10 rounded-xl font-semibold text-[12px] mt-4 shadow-md shadow-primary/20">
                                {roomForm.id ? 'Update Room' : 'Confirm Creation'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 md:gap-6 px-4 py-3 bg-muted/30 rounded-xl border border-primary/20 items-center justify-between">
                <div className="flex flex-wrap gap-4 md:gap-6 items-center">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/60 mr-2">Legend:</span>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[12px] font-medium">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-600">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-[12px] font-medium">Occupied</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground/50">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        <span className="text-[12px] font-medium">Maintenance</span>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostel.rooms?.map(room => (
                    <Card key={room.id} className="rounded-2xl border-primary/20 shadow-sm overflow-hidden hover:shadow-md transition-all relative group">
                        {/* Room Actions */}
                        <div className="absolute top-3 right-3 z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 backdrop-blur-sm border border-primary/20">
                                        <MoreVertical size={14} className="text-foreground/50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl p-1 min-w-[140px]">
                                    <DropdownMenuItem onClick={() => openEditRoom(room)} className="rounded-lg gap-2 font-semibold text-[12px] cursor-pointer">
                                        <Edit2 size={14} className="text-primary" /> Edit Room
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openDeleteRoom(room)} className="rounded-lg gap-2 font-semibold text-[12px] text-destructive cursor-pointer">
                                        <Trash2 size={14} /> Delete Room
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <CardHeader className="p-4 pb-0">
                            <div className="flex items-center gap-3 mb-1.5">
                                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                                    <Home size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-[14px] font-semibold">Room {room.number}</h3>
                                    <p className="text-foreground/50 font-semibold text-[10px] uppercase tracking-wide">Floor {room.floor} • Wing {room.number[0]}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-2 pb-4 border-b border-primary/20">
                                {room.beds?.map(bed => (
                                    <button
                                        key={bed.id}
                                        onClick={() => {
                                            setSelectedBed(bed);
                                            if (bed.status === 'AVAILABLE') {
                                                setIsCheckInOpen(true);
                                            } else if (bed.status === 'OCCUPIED') {
                                                setIsCheckOutOpen(true);
                                            } else {
                                                showInfo(`Bed ${bed.name} is ${bed.status.toLowerCase()}`);
                                            }
                                        }}
                                        className={`group relative p-3 rounded-xl flex items-center justify-between border transition-all hover:scale-[1.02] active:scale-95 ${bed.status === 'AVAILABLE' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10' :
                                            bed.status === 'OCCUPIED' ? 'bg-red-500/5 border-red-500/20 text-red-600 hover:bg-red-500/10' :
                                                'bg-muted/50 border-primary/20 text-foreground/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Bed size={14} strokeWidth={bed.status === 'AVAILABLE' ? 3 : 2} />
                                            <span className="font-semibold text-[12px]">{bed.name.split(' ')[1]}</span>
                                        </div>
                                        {bed.status === 'AVAILABLE' && <Plus size={12} strokeWidth={3} className="opacity-0 group-hover:opacity-100" />}
                                        {bed.status === 'OCCUPIED' && <User size={12} strokeWidth={3} className="opacity-50" />}
                                    </button>
                                ))}
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <p className={`text-[12px] ${room.beds?.filter(b => b.status === "AVAILABLE").length === 0 ? 'text-red-500' : 'text-foreground/50'}`}>
                                    {room.beds?.filter(b => b.status === "AVAILABLE").length} / {room.capacity} Vacant
                                </p>
                                <Button variant="ghost" size="sm" className="rounded-lg h-7 px-2 text-[11px] font-semibold uppercase hover:bg-muted/50">
                                    <Settings size={12} className="mr-1" /> Config
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Check-in Modal */}
            <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                <DialogContent className="max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-semibold mb-1">Check-in Student</DialogTitle>
                        <p className="text-foreground/60 font-medium text-[12px]">Assigning Bed {selectedBed?.name} • Room {hostel.rooms?.find(r => r.beds?.some(b => b.id === selectedBed?.id))?.number}</p>
                    </DialogHeader>
                    <form onSubmit={handleCheckIn} className="space-y-4 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="font-semibold text-[12px] ml-1">Find Student</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={14} />
                                    <Input
                                        className="rounded-xl h-10 pl-9 text-[12px]"
                                        placeholder="Search name or ID..."
                                        value={studentSearch}
                                        onChange={e => setStudentSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-semibold text-[11px] ml-1 uppercase tracking-wide text-foreground/50">Select Results</Label>
                                <div className="max-h-[200px] overflow-y-auto rounded-xl border border-primary/20 p-2 space-y-1 bg-muted/20">
                                    {filteredStudents.length > 0 ? filteredStudents.slice(0, 50).map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => setCheckInData({ ...checkInData, studentId: student.id })}
                                            className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${checkInData.studentId === student.id ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${checkInData.studentId === student.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                                    {student.firstName[0]}
                                                </div>
                                                <span className="font-semibold text-[12px]">{student.firstName} {student.lastName}</span>
                                            </div>
                                            <span className={`text-[10px] font-semibold uppercase ${checkInData.studentId === student.id ? 'text-white/70' : 'text-foreground/50'}`}>{student.studentId || student.id.slice(0, 6)}</span>
                                        </div>
                                    )) : (
                                        <div className="p-6 text-center text-foreground/50 text-[11px]">No students found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-2">
                            <Label className="font-semibold text-[12px] ml-1">Check-in Date</Label>
                            <Input
                                type="date"
                                required
                                className="rounded-xl h-10 text-[12px]"
                                value={checkInData.checkInDate}
                                onChange={e => setCheckInData({ ...checkInData, checkInDate: e.target.value })}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!checkInData.studentId}
                            className="w-full h-10 rounded-xl font-semibold text-[12px] shadow-md shadow-primary/20 bg-primary text-white mt-4"
                        >
                            <UserPlus className="mr-1.5" size={14} /> Assign Bed
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Room Deletion Dialog */}
            <Dialog open={isDeleteRoomOpen} onOpenChange={setIsDeleteRoomOpen}>
                <DialogContent className="max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-semibold text-destructive">Delete Room?</DialogTitle>
                    </DialogHeader>
                    <div className="py-3 font-medium text-[12px] leading-relaxed">
                        Are you sure you want to delete <span className="font-semibold text-foreground">Room {roomForm.number}</span>? This will remove all beds and current assignments in this room.
                    </div>
                    <div className="flex gap-3 mt-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteRoomOpen(false)}
                            className="flex-1 h-10 rounded-xl font-semibold text-[12px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteRoom}
                            className="flex-1 h-10 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold text-[12px] shadow-md shadow-destructive/20"
                        >
                            Delete Room
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Check-out Modal */}
            <Dialog open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                <DialogContent className="max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-semibold mb-1 tracking-tight">Process Check-out</DialogTitle>
                        <p className="text-foreground/60 font-medium text-[12px]">Bed {selectedBed?.name} is currently occupied.</p>
                    </DialogHeader>

                    {selectedBed?.allocations?.[0] && (
                        <div className="bg-muted/30 p-4 rounded-xl border border-primary/20 space-y-3 my-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary shadow-md flex items-center justify-center text-white font-semibold text-[12px]">
                                    {selectedBed.allocations[0].student?.firstName?.[0]}{selectedBed.allocations[0].student?.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-[12px] tracking-tight leading-none">{selectedBed.allocations[0].student?.firstName} {selectedBed.allocations[0].student?.lastName}</p>
                                    <p className="text-[11px] text-primary mt-0.5">Active Resident</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-foreground/60 pt-1">
                                <Clock size={12} /> Checked in on {new Date(selectedBed.allocations[0].checkInDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button variant="outline" className="h-10 rounded-xl font-semibold text-[12px]" onClick={() => setIsCheckOutOpen(false)}>
                            Keep Assignment
                        </Button>
                        <Button className="h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-[12px] gap-1.5 shadow-md shadow-red-500/20" onClick={handleCheckOut}>
                            <LogOut size={14} /> Release Bed
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {hostel.rooms?.length === 0 && (
                <div className="py-20 text-center bg-white/75 border-2 border-dashed border-primary/20 rounded-2xl animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home size={32} className="text-foreground/20" />
                    </div>
                    <h2 className="text-[16px] font-semibold mb-1">No Rooms in this Building</h2>
                    <p className="text-foreground/60 text-[12px] font-medium max-w-sm mx-auto">
                        Click the "Add Room" button in the top right to start populating this hostel building.
                    </p>
                </div>
            )}
        </div>
    </RequireBranch>
    );
}

export default function ManageRoomsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                <p className="font-semibold text-muted-foreground/20 uppercase tracking-[0.3em] text-xs">Accessing Portal...</p>
            </div>
        }>
            <ManageRoomsContent />
        </Suspense>
    );
}
