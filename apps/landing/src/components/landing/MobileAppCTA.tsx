import React from "react";
import Image from "next/image";

export function MobileAppCTA() {
  return (
    <section className="py-20 relative overflow-hidden max-w-7xl mx-auto px-6 lg:px-8">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, rgba(79, 70, 229, 0.05) 50%, transparent 100%) pointer-events-none"></div>
      
      <div className="relative z-10 glass-card rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 text-left">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary font-heading leading-tight">
              Basaer in your <br />
              <span className="text-primary-light drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">Pocket.</span>
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-lg">
              Get instant push notifications for attendance, exam results, and direct teacher messaging. Designed for the elite parent on the move.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* App Store badge */}
            <div className="flex items-center gap-3 bg-surface-container/20 border border-border px-6 py-3 rounded-2xl hover:bg-surface-container/40 transition-all cursor-pointer">
              <Image
                alt="Apple Store"
                className="shrink-0"
                src="/placeholder.svg"
                width={28}
                height={28}
              />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-secondary/60 font-bold leading-none">Download on the</p>
                <p className="font-extrabold text-base text-text-primary tracking-tight mt-0.5">App Store</p>
              </div>
            </div>

            {/* Google Play badge */}
            <div className="flex items-center gap-3 bg-surface-container/20 border border-border px-6 py-3 rounded-2xl hover:bg-surface-container/40 transition-all cursor-pointer">
              <Image
                alt="Google Play"
                className="shrink-0"
                src="/placeholder.svg"
                width={28}
                height={28}
              />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-secondary/60 font-bold leading-none">GET IT ON</p>
                <p className="font-extrabold text-base text-text-primary tracking-tight mt-0.5">Google Play</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 pt-4">
            <div className="text-center md:text-left">
              <p className="text-2xl md:text-3xl font-extrabold text-primary-light font-heading">4.9/5</p>
              <p className="text-xs text-text-secondary font-semibold mt-0.5">App Rating</p>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center md:text-left">
              <p className="text-2xl md:text-3xl font-extrabold text-secondary font-heading">15k+</p>
              <p className="text-xs text-text-secondary font-semibold mt-0.5">Active Parents</p>
            </div>
          </div>
        </div>

        {/* Smartphone Floating Preview */}
        <div className="flex-1 relative flex justify-center w-full">
          <div className="relative w-64 md:w-72 h-[480px] md:h-[550px] bg-[#15121b] rounded-[2.5rem] border-8 border-border shadow-2xl overflow-hidden">
            <div className="absolute top-0 w-full h-8 bg-black/40 flex justify-center items-end pb-1.5 z-20">
              <div className="w-16 h-3.5 bg-black rounded-full"></div>
            </div>
            <Image
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover z-10"
              alt="Basaer mobile app interface screenshot"
              src="/placeholder.svg"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#7c3aed]/20 blur-3xl rounded-full -z-10"></div>
        </div>
      </div>
    </section>
  );
}
