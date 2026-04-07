import React from 'react';
import { Camera, MapPin, Phone, User, Mail, GraduationCap } from 'lucide-react';

interface StudentIDCardProps {
    student: {
        firstName: string;
        lastName: string;
        id: string;
        class?: { name: string };
        section?: { name: string };
        user?: { email: string; phone?: string };
    };
}

export const StudentIDCard: React.FC<StudentIDCardProps> = ({ student }) => {
    return (
        <div className="flex flex-col md:flex-row gap-8 p-8 justify-center items-center bg-muted/50 rounded-[3rem]">
            {/* Front Side */}
            <div className="relative w-[350px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-border/50 border flex flex-col group transition-all hover:scale-[1.02]">
                {/* Header Background */}
                <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-br from-primary via-primary/90 to-primary/80" />

                {/* School Logo/Name */}
                <div className="relative z-10 p-8 text-center">
                    <h2 className="text-white font-semibold text-2xl tracking-tighter">BASAEER</h2>
                    <p className="text-white/70 text-[10px] uppercase font-semibold tracking-[0.3em] mt-1">Modern School System</p>
                </div>

                {/* Profile Section */}
                <div className="relative z-10 flex flex-col items-center mt-4">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-xl shadow-primary/20">
                        <div className="w-full h-full rounded-[2.1rem] bg-muted flex items-center justify-center text-primary/40">
                            <User size={48} />
                        </div>
                    </div>
                    <div className="text-center mt-6 px-6">
                        <h3 className="text-3xl font-semibold tracking-tight text-foreground">{student.firstName} {student.lastName}</h3>
                        <p className="text-primary font-semibold uppercase tracking-widest text-xs mt-2 border-b-2 border-primary/20 pb-2 inline-block">Student</p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 px-8 py-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-primary/60">
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">Grade / Level</p>
                            <p className="font-bold text-foreground">{student.class?.name || 'Class A'} • {student.section?.name || 'Alpha'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-primary/60">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">Student ID</p>
                            <p className="font-bold text-foreground">#{student.id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="h-4 bg-primary" />
                <div className="p-4 bg-muted/10 text-center">
                    <div className="w-24 h-6 border-2 border-dashed border-muted-foreground/30 mx-auto rounded-lg flex items-center justify-center">
                        <span className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-tighter">QR CODE AREA</span>
                    </div>
                </div>
            </div>

            {/* Back Side */}
            <div className="relative w-[350px] h-[550px] bg-card rounded-[2.5rem] shadow-2xl overflow-hidden border-border/50 border flex flex-col group transition-all hover:scale-[1.02]">
                <div className="p-8 space-y-8">
                    <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4 border-b border-border pb-2">Institutional Info</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-muted-foreground mt-0.5" />
                                <p className="text-xs font-bold leading-relaxed">Main Campus, Digital Valley, Floor 4, Suite 402, Abuja, Nigeria</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-muted-foreground" />
                                <p className="text-xs font-bold">+234 800 227 2337</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-muted-foreground" />
                                <p className="text-xs font-bold">support@basaeer.com</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4 border-b border-border pb-2">Security Instructions</h4>
                        <ul className="space-y-2 list-disc list-inside text-[10px] font-bold text-muted-foreground leading-relaxed">
                            <li>This card remains the property of Basaeer School System.</li>
                            <li>Loss of card must be reported immediately to the admin office.</li>
                            <li>This card is non-transferable and must be worn at all times.</li>
                            <li>Misuse of this ID card attracts severe disciplinary action.</li>
                        </ul>
                    </div>

                    <div className="pt-8 text-center">
                        <div className="w-16 h-16 bg-muted/30 rounded-2xl mx-auto flex items-center justify-center mb-2">
                            <div className="w-10 h-10 border border-muted-foreground/20 rotate-45" />
                        </div>
                        <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Authorized Signature</p>
                    </div>
                </div>

                <div className="mt-auto p-8 bg-muted/30 flex justify-between items-center">
                    <div className="text-left">
                        <p className="text-[8px] font-semibold text-muted-foreground uppercase opacity-50">Valid Until</p>
                        <p className="text-xs font-semibold text-primary">AUG 2026</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-muted-foreground font-semibold text-sm tracking-tighter opacity-30">BASAEER</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};
