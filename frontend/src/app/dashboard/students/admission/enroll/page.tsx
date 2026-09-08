"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentService } from "@/services/studentService";
import { ClassService, Class } from "@/services/classService";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, UserPlus, CheckCircle, Loader2 } from "lucide-react";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const enrollSchema = z.object({
  firstName: z.string().min(2, "Min 2 chars"),
  lastName: z.string().min(2, "Min 2 chars"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  otherNames: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  city: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  secondaryGuardianName: z.string().optional(),
  secondaryGuardianPhone: z.string().optional(),
  guardianEmail: z.string().email("Valid guardian email").optional().or(z.literal("")),
  passportPhoto: z.string().optional(),
  birthCertificateUrl: z.string().optional(),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

export default function EnrollPage() {
  const { resolvedBranchId } = useAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string; tempPassword?: string; admissionNumber?: string } | null>(null);

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      classId: "",
      sectionId: "",
      otherNames: "",
      placeOfBirth: "",
      nationality: "",
      city: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      secondaryGuardianName: "",
      secondaryGuardianPhone: "",
      guardianEmail: "",
      passportPhoto: "",
      birthCertificateUrl: "",
    },
  });

  const watchClassId = form.watch("classId");
  const selectedClass = classes.find((c) => c.id === watchClassId);
  const sections = selectedClass?.sections || [];

  useEffect(() => {
    if (!resolvedBranchId) return;
    ClassService.getAll(resolvedBranchId).then(setClasses).catch(() => {});
  }, [resolvedBranchId]);

  const onSubmit = async (values: EnrollFormValues) => {
    if (!resolvedBranchId) {
      showError("Select a branch first");
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        branchId: resolvedBranchId,
        phone: values.phone || undefined,
        gender: values.gender || undefined,
        dob: values.dob || undefined,
        classId: values.classId || undefined,
        sectionId: values.sectionId || undefined,
        otherNames: values.otherNames || undefined,
        placeOfBirth: values.placeOfBirth || undefined,
        nationality: values.nationality || undefined,
        city: values.city || undefined,
        emergencyContactName: values.emergencyContactName || undefined,
        emergencyContactPhone: values.emergencyContactPhone || undefined,
        secondaryGuardianName: values.secondaryGuardianName || undefined,
        secondaryGuardianPhone: values.secondaryGuardianPhone || undefined,
        // guardianEmail is for shadow OnlineAdmission audit; not stored on Student directly
        // but passed to backend to create parent linkage if needed
        guardianEmail: values.guardianEmail || undefined,
        passportPhoto: values.passportPhoto || undefined,
        birthCertificateUrl: values.birthCertificateUrl || undefined,
      };
      // drop empty section if class not selected
      if (!payload.classId) delete payload.sectionId;

      const res: any = await StudentService.create(payload);
      // backend returns {id, tempPassword} via students.controller
      const id = res?.id || res?.data?.id || res?.student?.id;
      const tempPassword = res?.tempPassword || res?.data?.tempPassword;
      setCreated({ id: id || "unknown", tempPassword });
      showSuccess(`Student enrolled: ${values.firstName} ${values.lastName}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Enrollment failed";
      // class-validator returns array
      const detail = Array.isArray(msg) ? msg.join(", ") : msg;
      showError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsByStep: Record<number, (keyof EnrollFormValues)[]> = {
      1: ["firstName", "lastName", "email"],
      2: ["classId", "sectionId"],
      3: [],
    };
    const fields = fieldsByStep[step] || [];
    const valid = fields.length === 0 ? true : await form.trigger(fields);
    if (valid) setStep((s) => Math.min(3, s + 1));
  };

  if (created) {
    return (
      <RequireBranch requireSpecificBranch>
        <div className="max-w-3xl mx-auto space-y-6 pb-8 px-4">
          <BranchContextBanner />
          <Card className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-[16px] font-semibold text-primary">Student Enrolled</h2>
            <p className="text-[12px] text-muted-foreground">The student portal account was created. Share these credentials securely.</p>
            <div className="bg-muted/40 border rounded-xl p-4 text-left space-y-2 text-[12px]">
              <p><span className="font-semibold">Student ID:</span> {created.id}</p>
              {created.tempPassword && <p><span className="font-semibold">Temp Password:</span> <code className="bg-white px-2 py-1 rounded border text-[11px]">{created.tempPassword}</code></p>}
              <p className="text-[11px] text-amber-600">User must change password on first login.</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => setCreated(null)}>Enroll Another</Button>
              <NextLink href={`/dashboard/students/${created.id}`}><Button size="sm">View Student</Button></NextLink>
              <NextLink href="/dashboard/students/admission"><Button variant="ghost" size="sm">Back to Admission</Button></NextLink>
            </div>
          </Card>
        </div>
      </RequireBranch>
    );
  }

  return (
    <RequireBranch requireSpecificBranch>
      <div className="max-w-3xl mx-auto space-y-6 pb-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <BranchContextBanner />
        <div className="flex items-center gap-3">
          <NextLink href="/dashboard/students/admission" className="w-8 h-8 rounded-lg border bg-white flex items-center justify-center hover:bg-muted">
            <ArrowLeft size={14} />
          </NextLink>
          <div className="space-y-0.5">
            <h1 className="text-[20px] font-bold tracking-tight text-primary">Quick Enroll</h1>
            <p className="text-[12px] text-muted-foreground">Create a student directly — instant enrollment without application pipeline.</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[14px]">New Student</CardTitle>
                <CardDescription className="text-[12px]">Step {step} of 3 — {step === 1 ? "Candidate" : step === 2 ? "Academic" : "Additional"}</CardDescription>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">First Name *</Label>
                    <Input placeholder="Musa" {...form.register("firstName")} className="h-9 text-[12px]" />
                    {form.formState.errors.firstName && <p className="text-[11px] text-destructive">{form.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Last Name *</Label>
                    <Input placeholder="Ibrahim" {...form.register("lastName")} className="h-9 text-[12px]" />
                    {form.formState.errors.lastName && <p className="text-[11px] text-destructive">{form.formState.errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Email *</Label>
                    <Input placeholder="student@example.com" {...form.register("email")} className="h-9 text-[12px]" />
                    {form.formState.errors.email && <p className="text-[11px] text-destructive">{form.formState.errors.email.message}</p>}
                    <p className="text-[11px] text-muted-foreground">Portal login; auto-generates if left blank on backend.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Phone</Label>
                    <Input placeholder="080..." {...form.register("phone")} className="h-9 text-[12px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Gender</Label>
                    <Select value={form.watch("gender") || ""} onValueChange={(v) => form.setValue("gender", v)}>
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Date of Birth</Label>
                    <Input type="date" {...form.register("dob")} className="h-9 text-[12px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Other Names</Label>
                    <Input placeholder="Optional" {...form.register("otherNames")} className="h-9 text-[12px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Place of Birth</Label>
                    <Input placeholder="Kaduna" {...form.register("placeOfBirth")} className="h-9 text-[12px]" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Class</Label>
                    <Select value={form.watch("classId") || ""} onValueChange={(v) => { form.setValue("classId", v); form.setValue("sectionId", ""); }}>
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {classes.length === 0 && <p className="text-[11px] text-amber-600">No classes for this branch — create in Academics first.</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Section</Label>
                    <Select value={form.watch("sectionId") || ""} onValueChange={(v) => form.setValue("sectionId", v)} disabled={!watchClassId}>
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue placeholder={watchClassId ? "Select section" : "Select class first"} /></SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Nationality</Label>
                    <Input placeholder="Nigerian" {...form.register("nationality")} className="h-9 text-[12px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">City</Label>
                    <Input placeholder="Kaduna" {...form.register("city")} className="h-9 text-[12px]" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px]">Guardian Name <span className="text-muted-foreground font-normal">(optional, for audit)</span></Label>
                      <Input placeholder="Parent/Guardian full name" {...form.register("secondaryGuardianName")} className="h-9 text-[12px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px]">Guardian Phone</Label>
                      <Input placeholder="080..." {...form.register("secondaryGuardianPhone")} className="h-9 text-[12px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px]">Guardian Email <span className="text-muted-foreground font-normal">(for parent portal)</span></Label>
                      <Input placeholder="guardian@example.com" {...form.register("guardianEmail")} className="h-9 text-[12px]" />
                      {form.formState.errors.guardianEmail && <p className="text-[11px] text-destructive">{form.formState.errors.guardianEmail.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px]">Emergency Contact Name</Label>
                      <Input placeholder="Parent/Guardian" {...form.register("emergencyContactName")} className="h-9 text-[12px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px]">Emergency Contact Phone</Label>
                      <Input placeholder="080..." {...form.register("emergencyContactPhone")} className="h-9 text-[12px]" />
                    </div>
                  </div>
                  <div className="p-4 border rounded-xl bg-muted/20 space-y-3">
                    <h4 className="text-[12px] font-semibold text-primary">Documents (optional)</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">For Quick Enroll, docs are optional — you can add them later from the Student profile. Public admission requires them, but admin enroll is faster.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[12px]">Passport Photo URL</Label>
                        <Input placeholder="https://... or upload later" {...form.register("passportPhoto")} className="h-9 text-[12px]" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[12px]">Birth Certificate URL</Label>
                        <Input placeholder="https://..." {...form.register("birthCertificateUrl")} className="h-9 text-[12px]" />
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-600">Pending docs will show as “Docs pending” in the list until uploaded.</p>
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <p className="text-[11px] text-amber-700 leading-relaxed">On submit, a portal account (<code className="bg-white px-1 rounded">STUDENT</code>) is created with a temp password shown once. A shadow <code className="bg-white px-1 rounded">OnlineAdmission (ENROLLED, QUICK_ENROLL)</code> is also created for audit so nothing is dropped. Branch is fixed to <span className="font-semibold">{resolvedBranchId?.slice(0,8)}...</span>.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="text-[12px]">
                  Back
                </Button>
                {step < 3 ? (
                  <Button type="button" size="sm" onClick={nextStep} className="text-[12px] gap-1.5">
                    Next <ArrowRight size={14} />
                  </Button>
                ) : (
                  <Button type="submit" size="sm" disabled={submitting} className="text-[12px] gap-1.5">
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Enrolling…</> : <><UserPlus size={14} /> Enroll Student</>}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireBranch>
  );
}
