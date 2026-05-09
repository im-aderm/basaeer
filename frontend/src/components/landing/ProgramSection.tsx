"use client";

import React from "react";

export function ProgramSection() {
  const academics = [
    {
      title: "Early Years",
      subtitle: "Laying foundations of wonder.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtqvyz113YmeZwGA8K9J2y2B1bQFrMuqztZx0k9cjZR9jH6k_gOhSDpdIyCsZeZDzWiBHF1rR904IBLpqQ4X4_V6cY3Bt3F8ksaBv-_If6yB8hu_IAIgGQK_fubRiXBACypnhsv872kUFLjfMd8wGSsrpKErUjDw2PFGqoebfxM-Zro5iPAKEhR3UryWQBfsS9OWWF2Rg0zebze6QV8iV0fscBLHqj9KkFURhWVqO4LQAZnHPufBjlrctZyHsC-PP_LUko8VPpjnM",
    },
    {
      title: "Primary",
      subtitle: "Igniting critical exploration.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMJnv9cdv-h3OQLXAPKHCrUkwVOAgrA-orTkqDJfEEelhU1V98fNi1X2FVFGq9JSuXQeWRdMrJiSwY-2vr_XbOLJxV4_0dZWUEbW_h1U7uPHtvaXL_Aj_IfCGbDhpwoFgat4epZBv_PvKTJXDBrGHdFGzjjhfpailoLYKSxF2qsK94fpaN2soHZVZEUh-e5n0_Oone3yLrk0HQqOtfZjp_PFMmNGiMutbSBSOtxtV5wXbaw-OgguTqMM7laqNGEhdKCPtMtr9BVF8",
    },
    {
      title: "Secondary",
      subtitle: "Mastering complex horizons.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTsjDJcnieDuVEw80-lqp5B0sRAmWlo0YP634IlP9WSfE2dHEcTzPjknxZJlx7RZQFn_Kz3Ewa-_RQ-6oeKrrQSUlZXCgH1szBTr_pvJkT3xGNPvVAEhaQgh17LHc9M8PI6S8mfkf_oLE-3tgCFNc7kJuqsePwixgxtWAeM_35nr5Pvj1yl1dpxKe1OX5FcsLNZQtfeDF3oZzWrdwiJAtNycpeZxPgJ4-m0R2kuHLysevREY6cq6o-8cQ2q4WgMePjfvRaATe5rmI",
    },
    {
      title: "STEM Excellence",
      subtitle: "Engineering future realities.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxc5O_zaElvQB_K87YFWFjzAeG9I8iZbFNu1CLbyWG5aNK9HBlOBQF-2XJZyJXKG06h_rNTpNNbNr9fxJBPmC6eueyCpcQYWY6r2nloHprQCGTkwxEY9fGTYK-2F2n-DcB_B6nNynE-ywjMdrNMHKuhEdJonjS_RR_BJni0nMpzfNTW7CMcQGIu7Qgz3xKpi_YCeJO6ttHdS-EWCTQE_woDqd2DhizereZP0xAmj5EvLQKyZDm8TyHen0Kzt0LioyYRYh_SDBQxmA",
    },
  ];

  return (
    <section id="programs" className="py-20 max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
      <div className="space-y-4 text-left border-b border-white/5 pb-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white font-heading">
          Academic Excellence
        </h2>
        <div className="h-1 w-24 bg-[#7c3aed] mt-2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {academics.map((academic, idx) => (
          <div 
            key={idx} 
            className="group rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-3 hover:border-[#7c3aed]/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 relative">
              <img 
                alt={academic.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] grayscale group-hover:grayscale-0" 
                src={academic.image} 
              />
            </div>
            <div className="px-3 pb-3 space-y-1">
              <h4 className="text-xl font-bold text-white font-heading">
                {academic.title}
              </h4>
              <p className="text-sm text-[#ccc3d8]">
                {academic.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
