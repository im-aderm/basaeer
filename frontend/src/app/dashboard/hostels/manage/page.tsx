"use client";

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
import { toast } from "sonner";
import { HostelService, Hostel, Room, Bed as BedType } from "@/services/hostelService";
import { StudentService } from "@/services/studentService";

function ManageRoomsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
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
            console.error("Fetch failed:", error);
            toast.error("Failed to load building data");
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
                toast.success("Room updated successfully");
            } else {
                await HostelService.createRoom({ ...roomForm, hostelId: hostelId as string });
                toast.success("Room added successfully");
            }
            setIsRoomModalOpen(false);
            setRoomForm({ id: "", number: "", floor: 1, capacity: 4 });
            fetchData();
        } catch (error) {
            console.error("Room operation failed:", error);
            toast.error("Failed to perform room operation");
        }
    };

    const handleDeleteRoom = async () => {
        if (!roomForm.id) return;
        try {
            await HostelService.deleteRoom(roomForm.id);
            toast.success("Room deleted successfully");
            setIsDeleteRoomOpen(false);
            fetchData();
        } catch (error) {
            console.error("Delete room failed:", error);
            toast.error("Failed to delete room");
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
            toast.success("Student assigned to bed");
            setIsCheckInOpen(false);
            setCheckInData({ studentId: "", checkInDate: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) {
            console.error("Check-in failed:", error);
            toast.error("Failed to allocate bed");
        }
    };

    const handleCheckOut = async () => {
        if (!selectedBed?.allocations?.[0]?.id) return;
        try {
            await HostelService.releaseBed(selectedBed.allocations[0].id);
            toast.success("Bed released successfully");
            setIsCheckOutOpen(false);
            fetchData();
        } catch (error) {
            console.error("Check-out failed:", error);
            toast.error("Failed to process check-out");
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

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(studentSearch.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    if (!hostel) return <div className="p-8 text-center text-red-500 font-bold">Building not found or access denied.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Nav Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-2xl h-14 w-14 border-2 border-border/50 bg-card hover:bg-muted"
                    >
                        <ChevronLeft size={24} strokeWidth={3} />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tight">{hostel.name}</h1>
                        <p className="text-muted-foreground font-bold italic uppercase tracking-widest text-xs mt-1">Management Portal • {hostel.type}</p>
                    </div>
                </div>

                <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => setRoomForm({ id: "", number: "", floor: 1, capacity: 4 })}
                            className="h-14 px-8 rounded-2xl bg-primary text-white font-black italic gap-3 shadow-xl shadow-primary/20"
                        >
                            <Plus size={20} /> Add New Room
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic">{roomForm.id ? 'Edit Room' : 'Create New Room'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRoomSubmit} className="space-y-4 pt-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold ml-1 italic">Room Number / ID</Label>
                                <Input
                                    required
                                    className="rounded-xl h-12"
                                    placeholder="e.g. 101, B-42"
                                    value={roomForm.number}
                                    onChange={e => setRoomForm({ ...roomForm, number: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1 italic">Floor</Label>
                                    <Input
                                        type="number"
                                        required
                                        min={0}
                                        className="rounded-xl h-12"
                                        value={roomForm.floor}
                                        onChange={e => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1 italic">Bed Capacity</Label>
                                    <Input
                                        type="number"
                                        required
                                        min={1}
                                        className="rounded-xl h-12"
                                        value={roomForm.capacity}
                                        readOnly={!!roomForm.id}
                                        onChange={e => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                                    />
                                    {roomForm.id && <p className="text-[10px] text-muted-foreground italic ml-1">Capacity cannot be changed after creation</p>}
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl font-black italic text-lg mt-4 shadow-lg shadow-primary/20">
                                {roomForm.id ? 'Update Room' : 'Confirm Creation'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 md:gap-8 px-8 py-4 bg-muted/30 rounded-[2rem] border border-border/50 items-center justify-between">
                <div className="flex flex-wrap gap-4 md:gap-8 items-center">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mr-4">Status Legend:</span>
                    <div className="flex items-center gap-2 text-green-600">
                        <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm" />
                        <span className="text-[10px] font-black italic uppercase tracking-widest">Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600">
                        <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
                        <span className="text-[10px] font-black italic uppercase tracking-widest">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-4 h-4 rounded-full bg-slate-400 shadow-sm" />
                        <span className="text-[10px] font-black italic uppercase tracking-widest">Maintenance</span>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hostel.rooms?.map(room => (
                    <Card key={room.id} className="rounded-[3rem] border-border/50 shadow-xl overflow-hidden hover:shadow-2xl transition-all relative group">
                        {/* Room Actions */}
                        <div className="absolute top-6 right-6 z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-card/80 backdrop-blur-sm border border-border/50">
                                        <MoreVertical size={18} className="text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                                    <DropdownMenuItem onClick={() => openEditRoom(room)} className="rounded-xl gap-3 font-bold italic cursor-pointer">
                                        <Edit2 size={16} className="text-primary" /> Edit Room
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openDeleteRoom(room)} className="rounded-xl gap-3 font-bold italic text-destructive cursor-pointer">
                                        <Trash2 size={16} /> Delete Room
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                                    <Home size={28} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-3xl font-black italic">Room {room.number}</h3>
                                    <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest italic">Floor {room.floor} • Wing {room.number[0]}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 gap-3 pb-6 border-b border-border/50">
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
                                                toast.info(`Bed ${bed.name} is ${bed.status.toLowerCase()}`);
                                            }
                                        }}
                                        className={`group relative p-4 rounded-2xl flex items-center justify-between border-2 transition-all hover:scale-[1.02] active:scale-95 ${bed.status === 'AVAILABLE' ? 'bg-green-50/50 border-green-200 text-green-700 hover:bg-green-100' :
                                            bed.status === 'OCCUPIED' ? 'bg-red-50/50 border-red-200 text-red-700 hover:bg-red-100' :
                                                'bg-muted/50 border-border/50 text-muted-foreground'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Bed size={16} strokeWidth={bed.status === 'AVAILABLE' ? 3 : 2} />
                                            <span className="font-black italic text-sm">{bed.name.split(' ')[1]}</span>
                                        </div>
                                        {bed.status === 'AVAILABLE' && <Plus size={14} strokeWidth={3} className="opacity-0 group-hover:opacity-100" />}
                                        {bed.status === 'OCCUPIED' && <User size={14} strokeWidth={3} className="opacity-50" />}
                                    </button>
                                ))}
                            </div>
                            <div className="pt-6 flex justify-between items-center">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${room.beds?.filter(b => b.status === "AVAILABLE").length === 0 ? 'text-red-500' : 'text-muted-foreground/50'}`}>
                                    {room.beds?.filter(b => b.status === "AVAILABLE").length} / {room.capacity} Vacant Beds
                                </p>
                                <Button variant="ghost" size="sm" className="rounded-xl h-8 px-3 text-[10px] font-black uppercase hover:bg-muted/50">
                                    <Settings size={14} className="mr-1" /> Config
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Check-in Modal */}
            <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic mb-2">Check-in Student</DialogTitle>
                        <p className="text-muted-foreground font-bold italic text-sm italic">Assigning Bed {selectedBed?.name} • Room {hostel.rooms?.find(r => r.beds?.some(b => b.id === selectedBed?.id))?.number}</p>
                    </DialogHeader>
                    <form onSubmit={handleCheckIn} className="space-y-4 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold ml-1 italic">Find Student</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                    <Input
                                        className="rounded-xl h-11 pl-10"
                                        placeholder="Search name or ID..."
                                        value={studentSearch}
                                        onChange={e => setStudentSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold ml-1 italic text-xs uppercase tracking-widest opacity-50">Select Results</Label>
                                <div className="max-h-[200px] overflow-y-auto rounded-xl border p-2 space-y-1 bg-muted/20">
                                    {filteredStudents.length > 0 ? filteredStudents.slice(0, 50).map(student => (
                                        <div
                                            key={student.id}
                                            onClick={() => setCheckInData({ ...checkInData, studentId: student.id })}
                                            className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${checkInData.studentId === student.id ? 'bg-primary text-white shadow-md' : 'hover:bg-muted bg-card'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${checkInData.studentId === student.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                                    {student.firstName[0]}
                                                </div>
                                                <span className="font-bold italic text-sm">{student.firstName} {student.lastName}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase ${checkInData.studentId === student.id ? 'text-white/70' : 'text-muted-foreground'}`}>{student.studentId || student.id.slice(0, 6)}</span>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center text-muted-foreground italic text-xs">No students found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-2">
                            <Label className="font-bold ml-1 italic">Check-in Date</Label>
                            <Input
                                type="date"
                                required
                                className="rounded-xl h-12"
                                value={checkInData.checkInDate}
                                onChange={e => setCheckInData({ ...checkInData, checkInDate: e.target.value })}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!checkInData.studentId}
                            className="w-full h-14 rounded-xl font-black italic text-lg shadow-lg shadow-primary/20 bg-primary text-white mt-4"
                        >
                            <UserPlus className="mr-2" /> Assign Bed
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Room Deletion Dialog */}
            <Dialog open={isDeleteRoomOpen} onOpenChange={setIsDeleteRoomOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic text-destructive">Delete Room?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 font-medium italic text-base leading-relaxed">
                        Are you sure you want to delete <span className="font-black text-foreground">Room {roomForm.number}</span>? This will remove all beds and current assignments in this room.
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteRoomOpen(false)}
                            className="flex-1 h-12 rounded-xl font-bold italic"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteRoom}
                            className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black italic shadow-lg shadow-destructive/20"
                        >
                            Delete Room
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Check-out Modal */}
            <Dialog open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic mb-2 tracking-tight">Process Check-out</DialogTitle>
                        <p className="text-muted-foreground font-bold italic text-sm">Bed {selectedBed?.name} is currently occupied.</p>
                    </DialogHeader>

                    {selectedBed?.allocations?.[0] && (
                        <div className="bg-muted/30 p-6 rounded-[2rem] border-2 border-border/50 space-y-4 my-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary shadow-lg flex items-center justify-center text-white font-black text-xl italic uppercase">
                                    {selectedBed.allocations[0].student?.firstName?.[0]}{selectedBed.allocations[0].student?.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-black italic text-xl tracking-tight leading-none">{selectedBed.allocations[0].student?.firstName} {selectedBed.allocations[0].student?.lastName}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Active Resident</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold italic text-muted-foreground pt-2">
                                <Clock size={16} /> Checked in on {new Date(selectedBed.allocations[0].checkInDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <Button variant="outline" className="h-14 rounded-xl font-black italic" onClick={() => setIsCheckOutOpen(false)}>
                            Keep Assignment
                        </Button>
                        <Button className="h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black italic gap-2 shadow-lg shadow-red-500/20" onClick={handleCheckOut}>
                            <LogOut size={20} /> Release Bed
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {hostel.rooms?.length === 0 && (
                <div className="py-32 text-center bg-card/50 border-2 border-dashed border-border/50 rounded-[4rem] animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Home size={48} className="text-muted-foreground/30" />
                    </div>
                    <h2 className="text-3xl font-black italic mb-2">No Rooms in this Building</h2>
                    <p className="text-muted-foreground text-lg font-medium italic max-w-sm mx-auto leading-relaxed">
                        Click the "Add New Room" button in the top right to start populating this hostel building.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function ManageRoomsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                <p className="font-black italic text-muted-foreground/20 uppercase tracking-[0.3em] text-xs">Accessing Portal...</p>
            </div>
        }>
            <ManageRoomsContent />
        </Suspense>
    );
}
