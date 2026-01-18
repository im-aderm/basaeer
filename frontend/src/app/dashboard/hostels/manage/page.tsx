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
    Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

    // Modal states
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

    // Form states
    const [newRoom, setNewRoom] = useState({
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

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await HostelService.createRoom({ ...newRoom, hostelId });
            toast.success("Room added successfully");
            setIsAddRoomOpen(false);
            setNewRoom({ number: "", floor: 1, capacity: 4 });
            fetchData();
        } catch (error) {
            console.error("Add room failed:", error);
            toast.error("Failed to add room");
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

                <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black italic gap-3 shadow-xl shadow-primary/20">
                            <Plus size={20} /> Add New Room
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic">Create New Room</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddRoom} className="space-y-4 pt-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold ml-1 italic">Room Number / ID</Label>
                                <Input
                                    required
                                    className="rounded-xl h-12"
                                    placeholder="e.g. 101, B-42"
                                    value={newRoom.number}
                                    onChange={e => setNewRoom({ ...newRoom, number: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1 italic">Floor</Label>
                                    <Input
                                        type="number"
                                        required
                                        className="rounded-xl h-12"
                                        value={newRoom.floor}
                                        onChange={e => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1 italic">Bed Capacity</Label>
                                    <Input
                                        type="number"
                                        required
                                        className="rounded-xl h-12"
                                        value={newRoom.capacity}
                                        onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl font-black italic text-lg mt-4">
                                Confirm Creation
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Legend */}
            <div className="flex gap-8 px-8 py-4 bg-muted/30 rounded-[2rem] border border-border/50 items-center">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mr-4">Status Legend:</span>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm" />
                    <span className="text-[10px] font-black italic">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-[10px] font-black italic">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-400 shadow-sm" />
                    <span className="text-[10px] font-black italic">Maintenance</span>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hostel.rooms?.map(room => (
                    <Card key={room.id} className="rounded-[3rem] border-border/50 shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black italic">Room {room.number}</h3>
                                <p className="text-muted-foreground font-bold text-xs uppercase italic">Floor {room.floor}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-2xl">
                                <Home size={24} className="text-muted-foreground/50" />
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
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">
                                    {room.beds?.filter(b => b.status === "AVAILABLE").length} / {room.capacity} Vacancy
                                </p>
                                <Button variant="ghost" size="sm" className="rounded-xl h-8 px-3 text-[10px] font-black uppercase hover:bg-muted/50">
                                    <Settings size={14} className="mr-1" /> View History
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
                        <p className="text-muted-foreground font-bold italic text-sm">Assigning Bed {selectedBed?.name} in {hostel.name}</p>
                    </DialogHeader>
                    <form onSubmit={handleCheckIn} className="space-y-4 pt-4">
                        <div className="space-y-1.5">
                            <Label className="font-bold ml-1 italic">Student Search</Label>
                            <select
                                required
                                className="w-full rounded-xl h-12 px-4 border bg-background font-bold italic appearance-none"
                                value={checkInData.studentId}
                                onChange={e => setCheckInData({ ...checkInData, studentId: e.target.value })}
                            >
                                <option value="">Select a student...</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold ml-1 italic">Check-in Date</Label>
                            <Input
                                type="date"
                                required
                                className="rounded-xl h-12"
                                value={checkInData.checkInDate}
                                onChange={e => setCheckInData({ ...checkInData, checkInDate: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full h-14 rounded-xl font-black italic text-lg shadow-lg shadow-primary/20 bg-primary text-white mt-4">
                            <UserPlus className="mr-2" /> Complete Allocation
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Check-out Modal */}
            <Dialog open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic mb-2">Check-out / Release</DialogTitle>
                        <p className="text-muted-foreground font-bold italic text-sm">Bed {selectedBed?.name} is currently occupied.</p>
                    </DialogHeader>

                    {selectedBed?.allocations?.[0] && (
                        <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 space-y-4 my-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                    {selectedBed.allocations[0].student?.firstName?.[0]}{selectedBed.allocations[0].student?.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-black italic text-lg">{selectedBed.allocations[0].student?.firstName} {selectedBed.allocations[0].student?.lastName}</p>
                                    <p className="text-xs font-bold text-muted-foreground">Student ID: {selectedBed.allocations[0].studentId.slice(0, 8)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold italic text-muted-foreground">
                                <Clock size={16} /> Checked in on {new Date(selectedBed.allocations[0].checkInDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1 h-14 rounded-xl font-black italic" onClick={() => setIsCheckOutOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-[2] h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black italic gap-2 shadow-lg shadow-red-500/20" onClick={handleCheckOut}>
                            <LogOut size={20} /> Process Check-out
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {hostel.rooms?.length === 0 && (
                <div className="py-32 text-center bg-card/50 border-2 border-dashed border-border/50 rounded-[4rem]">
                    <h2 className="text-2xl font-black italic mb-2">No Rooms in this Building</h2>
                    <p className="text-muted-foreground font-medium italic">Click "Add New Room" above to start populating this hostel.</p>
                </div>
            )}
        </div>
    );
}

export default function ManageRoomsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading building portal...</div>}>
            <ManageRoomsContent />
        </Suspense>
    );
}
