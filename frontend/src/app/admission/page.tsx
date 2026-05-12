"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

// Let's check Navbar and MultiStepAdmissionForm: they use Lucide-react! E.g., Mail, CheckCircle2, ChevronDown, ChevronUp etc.
// Let's use Lucide icons for maximum consistency and safety!
import { 
  Mail as MailIcon, 
  ClipboardCheck, 
  CheckCircle as VerifiedIcon, 
  PartyPopper, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Inquiry",
    description: "Submit an online inquiry form to receive our prospectus and schedule a personal school tour.",
    icon: MailIcon,
  },
  {
    id: 2,
    title: "Assessment",
    description: "Prospective students undergo a holistic evaluation focusing on academic potential and character alignment.",
    icon: ClipboardCheck,
    reverse: true,
  },
  {
    id: 3,
    title: "Enrollment",
    description: "Secure your seat by completing the registration documents and processing the initial tuition fee.",
    icon: VerifiedIcon,
  },
  {
    id: 4,
    title: "Orientation",
    description: "Welcome to the Basaer family! Join our induction program to meet mentors and fellow students.",
    icon: PartyPopper,
    reverse: true,
  },
];

const tiers = [
  {
    name: "FOUNDATION",
    price: "$12,500",
    features: ["Academic Curriculum", "Standard Labs Access", "Digital Resources"],
  },
  {
    name: "ELITE PATHWAY",
    price: "$18,200",
    features: ["Advanced STEM Modules", "Tahfeez Excellence Track", "Personalized Mentorship", "International Field Trips"],
    featured: true,
  },
  {
    name: "SCHOLARS TIER",
    price: "$15,400",
    features: ["Honors Curriculum", "University Prep Labs", "Sports & Arts Academy"],
  },
];

const documents = [
  "Passport Size Photographs (4x)",
  "Certified Birth Certificate",
  "Previous School Records (Last 2 Years)",
  "Medical Immunization Records",
  "Parent/Guardian ID Proof",
];

const faqsData = [
  {
    question: "When is the deadline for Fall admissions?",
    answer: "Applications for the Fall semester close on July 31st. We recommend applying early as seats are limited.",
  },
  {
    question: "Are there any scholarship opportunities available?",
    answer: "Yes! Basaer offers merit-based and need-based scholarships. Inquire during the assessment phase.",
  },
  {
    question: "Do you offer sibling discounts?",
    answer: "Yes, we provide a 10% tuition discount for the second child and 15% for the third and subsequent children enrolled simultaneously.",
  },
  {
    question: "Is the entrance assessment conducted online?",
    answer: "Yes, assessments can be conducted either in person on campus or securely online for international applicants.",
  },
];

export default function AdmissionsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(2); // sibling discount open by default as in design
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-tight">
              Embark on a Journey of <span className="text-[#d2bbff] drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">Excellence</span>.
            </h1>
            <p className="text-lg md:text-xl text-[#ccc3d8] max-w-2xl mx-auto leading-relaxed">
              Discover a nurturing environment where spiritual wisdom meets modern academic rigor. Join a community dedicated to shaping the visionary leaders of tomorrow.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/admission/apply/1"
                className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] hover:scale-105 transition-all duration-300"
              >
                Apply Now
              </Link>
              <Link
                href="/#campuses"
                className="px-8 py-4 rounded-full text-[#e8dfee] font-bold bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                Explore Campus
              </Link>
            </div>
          </div>
          {/* Decorative Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3aed]/10 rounded-full blur-[120px] -z-10"></div>
        </section>

        {/* Admission Process */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white font-heading mb-16">
            Admission Process
          </h2>
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#7c3aed]/50 to-transparent"></div>

            {/* Steps */}
            <div className="space-y-12">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 ${
                      step.reverse ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-[#7c3aed]/30 flex items-center justify-center z-10 shrink-0 relative">
                      <Icon className="text-[#d2bbff] w-8 h-8" />
                      {step.id === 1 && (
                        <div className="absolute inset-0 rounded-full animate-pulse bg-[#7c3aed]/20 -z-10"></div>
                      )}
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex-1 md:max-w-[42%] shadow-xl">
                      <h3 className="text-2xl font-bold text-white font-heading mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[#ccc3d8] text-base leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tuition & Value */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
              Tuition &amp; Value
            </h2>
            <p className="text-lg text-[#ccc3d8]">
              Transparent pricing designed to fuel world-class education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white/5 backdrop-blur-md p-8 rounded-3xl flex flex-col transition-all duration-300 border ${
                  tier.featured
                    ? "border-[#7c3aed]/50 relative overflow-hidden md:scale-105 shadow-2xl shadow-[#7c3aed]/10"
                    : "border-white/10 hover:border-[#7c3aed]/30"
                }`}
              >
                {tier.featured && (
                  <div className="absolute top-0 right-0 bg-[#7c3aed] px-4 py-1 rounded-bl-xl font-bold text-[10px] text-white tracking-widest uppercase">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#d2bbff] tracking-widest uppercase font-heading">
                    {tier.name}
                  </span>
                  <div className="text-4xl md:text-5xl font-bold text-white font-heading mt-2 flex items-baseline">
                    {tier.price}
                    <span className="text-sm font-medium text-[#ccc3d8] ml-2">/ yr</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-base text-[#e8dfee]">
                      <CheckCircle2 className="text-[#d2bbff] w-5 h-5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admission/apply/1"
                  className={`w-full py-3.5 rounded-2xl font-bold text-center transition-all duration-300 ${
                    tier.featured
                      ? "bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-105"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {tier.featured ? "Apply for Elite" : "Select Tier"}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements Checklist */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 lg:p-12 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">
                Document Checklist
              </h2>
              <p className="text-[#ccc3d8] text-base leading-relaxed">
                Please ensure you have high-quality digital scans of the following documents ready for your application portal.
              </p>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <label
                    key={doc}
                    className="flex items-center gap-4 group cursor-pointer"
                    onClick={() => toggleDoc(doc)}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedDocs[doc]}
                      onChange={() => {}}
                      className="w-6 h-6 rounded border-white/20 bg-white/5 text-[#7c3aed] focus:ring-[#7c3aed]/50 transition-all cursor-pointer"
                    />
                    <span className={`text-base font-medium transition-colors ${
                      checkedDocs[doc] ? "text-[#d2bbff] line-through decoration-[#7c3aed]" : "text-[#e8dfee] group-hover:text-[#d2bbff]"
                    }`}>
                      {doc}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl border border-white/10">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOpf3nH2QmUWMx83x-35x2gDH1JORY0jMwK-e27og4lxuW-XZHFyg8oYiSd-1R78f0Mm5FpBzW25mu_f6zDLGQlXpKV1t-gktX5dKdqaSCvxJt4aPNKswbMsN4selSrEMGpcgh4fyIvlJgtmXfvPQBkzMiTX_vP5wVBIy3Lzrp6NVJM-IQkJhRtUYPUqb_H5f8NkUdA-CK4OADRAmrScLI0K9tDO3fwpdPi9pC0D5aLUc_ZkEAwczjonP7l18KQT5f4C2m4jmbQFA"
                alt="Admissions Workspace"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white font-heading mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqsData.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className={`bg-white/5 backdrop-blur-md p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    isOpen ? "border-[#7c3aed]/40 shadow-[0_0_20px_rgba(124,58,237,0.1)]" : "border-white/10 hover:border-[#7c3aed]/20"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className={`text-lg font-bold font-heading ${isOpen ? "text-[#d2bbff]" : "text-white"}`}>
                      {faq.question}
                    </h4>
                    {isOpen ? (
                      <ChevronUp className="text-[#d2bbff] w-5 h-5 shrink-0" />
                    ) : (
                      <ChevronDown className="text-[#ccc3d8] w-5 h-5 shrink-0" />
                    )}
                  </div>
                  {isOpen && (
                    <p className="text-[#ccc3d8] text-base leading-relaxed border-t border-white/5 mt-4 pt-4">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-[#7c3aed]/5 rounded-[40px] p-8 md:p-16 text-center relative overflow-hidden border border-white/10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white font-heading mb-6 leading-tight">
              Ready to illuminate your future?
            </h2>
            <p className="text-lg text-[#ccc3d8] max-w-xl mx-auto mb-8">
              Our admissions team is ready to guide you through every step of the enrollment process. Begin your legacy today.
            </p>
            <Link
              href="/admission/apply/1"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] hover:scale-105 transition-all duration-300"
            >
              Start Your Application
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Glowing blur effects */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#7c3aed]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#4f46e5]/20 rounded-full blur-3xl"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
