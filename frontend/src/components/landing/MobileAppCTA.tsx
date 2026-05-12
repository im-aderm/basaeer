import React from "react";

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
              <img 
                alt="Apple Store" 
                className="w-7 h-7 shrink-0" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsds43ihlvmcma9HDUb99689jC128sOuPI8FtbZSvaTV4Nko2xKYsHP4acKVd4CVdyyEpuCxk3fwleDbYE4-tU-Pf4DMQp_JfHBcNIeMCvf_pdBu9ZpNNyqr-TyIrNIfU7oS_gBGoEDRknXsFo1j4SZQFnu_k3OY6mH_cpy0SXGvttqVWK6Pa0yquznWSxQQ_IlvVEELBG05WbRSnEmgG-ZGwnT84r79BLp3rblJnWnwF8chwpcb5JnRilNyugx0tMjVkCOolT210" 
              />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-text-secondary/60 font-bold leading-none">Download on the</p>
                <p className="font-extrabold text-base text-text-primary tracking-tight mt-0.5">App Store</p>
              </div>
            </div>

            {/* Google Play badge */}
            <div className="flex items-center gap-3 bg-surface-container/20 border border-border px-6 py-3 rounded-2xl hover:bg-surface-container/40 transition-all cursor-pointer">
              <img 
                alt="Google Play" 
                className="h-7 shrink-0" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN3v_tnoLQbjuoJRkH_tK35K2RDihBEM410-PAbdEGlsI5XyC-cDmAQf-tJAiA1qevxZtOm9FXYhAHG3t_vhlZ_m5bbFpYWPqwbG3osfnfKkItKXhVeABGjOJZBJJfeCvJk0Vhk9gxhMPXiSgPcTTqxJDAzvKp6g08XiK-IGUgGBusKNQG6eHhH4BQm_QEE-Lj5UWIMKpD4q8t0-2VJjruWIWLIgvxmImJA3tHUe97U1g9D7QgwhDxVAkrzqpDZL8VSmij47UVkiE" 
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
            <img 
              className="w-full h-full object-cover z-10" 
              alt="Basaer mobile app interface screenshot" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzefjLDtA1Qi18VmwZQo5A2J6vJ_ndAafnVTb5nRw6i3BYphOOv9rMvHkCgLCGZOmM_wQftWIi3dDDMC9puK_MaqN9nGycNZTfMhK-tSNX4lecmy3f82hb521qaZxxDzroWU3bIdyijTly1bKZWEd8AMQCsTLZoK2JxfLqNjOp61f64BHTQ6yQYY1mz72YYVeTisUdAo4ppIsHdDja5UZ1o45G6CrBAD8KVR8pereHSXn1F2cCDbyL0_aF5BWGB56_bEZU-25f1AQ" 
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#7c3aed]/20 blur-3xl rounded-full -z-10"></div>
        </div>
      </div>
    </section>
  );
}
