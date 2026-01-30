"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, School, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <header className="px-6 h-16 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <School size={24} />
          <span>Basaeer</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            System Operational
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Classic School Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Simplified.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Empower your educational institution with Basaeer. Streamline administration,
            enhance learning, and connect your community.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="group px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-3 bg-card border border-input text-foreground rounded-xl font-semibold text-lg hover:bg-accent hover:text-accent-foreground transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full px-4">
          <FeatureCard
            icon={<ShieldCheck size={32} />}
            title="Secure Access"
            desc="Role-based access control ensuring data privacy and security for all users."
          />
          <FeatureCard
            icon={<Users size={32} />}
            title="Multi-Branch"
            desc="Seamlessly manage multiple campuses from a single unified dashboard."
          />
          <FeatureCard
            icon={<School size={32} />}
            title="Academic Excellence"
            desc="Tools designed to support teachers and students in achieving their best."
          />
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        © {new Date().getFullYear()} Basaeer School System. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border text-left shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 text-primary bg-primary/10 w-fit p-3 rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  )
}
