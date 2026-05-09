"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { motion } from "framer-motion";
import { 
  Atom, 
  Palette, 
  Trophy, 
  Users, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Binary, 
  MessageSquare,
  Sparkles,
  Award
} from "lucide-react";

const events = [
  {
    title: "National Science Fair",
    date: "MARCH 2024",
    location: "Main Campus Auditorium",
    description: "Showcasing innovative research projects from students across the region in our state-of-the-art facilities.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLxxmqKDs8__ig5bxFLzuvMpuuHt-Du4pS6lWq-83Qn3pgvtrbslqoaCupRidu93oEUWApI82EH36JJOO8yPfkdpD0RflYZuaIFV5ZQ6zAWIoSNfDb8EOoP64nDKQ2jCzECKfeBzeZt768ASuQxdObGiHGEA5YSaxsGndV30862v0rIXzPcaGuv3aq23eXTTTL0D1HOnQEN092tQz4-epDcljOk3p_kNVwe4hTkQfnrcIgdSsdhBgqEqt6q-ssQghJx6nwVj23c8",
  },
  {
    title: "International Quran Competition",
    date: "MAY 2024",
    location: "Tahfeez Center",
    description: "A spiritual gathering of beautiful voices reciting with Tajweed, judged by world-renowned Qaris.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBx_v6i-fv1kM-Dobs4XO-aN5HbJ4VFxNn8PsZ695KcR-SRNArj4aTHqmi5c3LFrbpMOYwrrHzWqma6Ijs73ySS8-70E1Rz84ebjtXDN5ZkOML7aDa27BRpTc8innSj3UKVSbqxjCyPE1ZK1J7lo3YkrU3M3dY2BIpYS3TQD2t8hXMvOK35W8QyudZL6v-CmQZafu6LwScLDrNFrqwYf_X5Aqffi8tI8LTCgaTSPSUgkS0Dsf4nRiu5zY39i8_IP6WHZpqeIpCgWX0",
    featured: true,
  },
  {
    title: "Basaeer Olympiad",
    date: "OCT 2024",
    location: "Central Stadium",
    description: "Our signature annual sports day featuring track, field, and team sports in a festival atmosphere.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaku0oI-FRRNWPhGIhaULIHHJETCu4_H75H2_-nmW6Z11skPKny11UbtGdMvJJZBNyn73nckZvS61oFItwPVFBkJD1vyg5fnSMZoveKljCwr15pzdaO47mAql2PWHeFAhViIKzQNlXKwOAgKprdwhgT1IhcLEzqU1DpOI3fhcQ9E3yiqwBA57CAp7x59OcUJVMzYirqYc4z0hm7iOiw8DXRc5MSXyVVhcdUuaz6Bjd5eROpHr1SwoJ0l_LfEJqvnKVL486SF0skCI",
  },
];

const sideTrips = [
  {
    title: "Silicon Valley Tech Tour",
    subtitle: "Innovation & Entrepreneurship",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1h2zR_n3dVie7HZOEjX732reWdYAFXZhZraHioXMbAtl0e8_cIY_ZRHQX_meZPkQOXknaxxzROca-wpKErZWTj1PK4M_lXF0EvEwEMPPsRLqcubDeu-6_T7kVRLN6E15AcFy45xNQLMQfdcaUi0AYQs_xR2eC06W_F2c6utAJww2qSiOcAV2vzOBqa5bfzcVZVoelsZ3NRxuHWhF1tRT27hFpsoL0593_OrXhV-8bywVxXWmg7gWv41pYJ1-tHuNEhuZsh3g8HcA",
  },
  {
    title: "Amazonian Eco-Research",
    subtitle: "Environmental Sciences",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4_nvNuaLXjQE5uzmccMsu81ZPhsS7Hyv9KSW7H7MuHxMSPhN1tVtg7oA5HNiGxX82tUuzbGwAWdxxKRSX-BsRZjJiCESz7AiUhcADC5QXk5YVwbz6Y1U6yZhz_LAk7wym0EFSjHaqP2druBp3uN1I0BdJE7mQxvG84C3pl9y32b1J67OPx2OiYb2nozK0Asn3NhDObBJ2uk3C-XDpiJ20FKY1koh1GRPpKQPIXSGKlwGb9JZ5Htv2iakrKdfgFFUGEDhH67dpJ8I",
  },
  {
    title: "London Leadership Summit",
    subtitle: "Global Governance",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDldw-UbzXKeUgpGRNi69ZNpi-6X3dXw-Uki8RsKZfMPBfq_VO_GPGDUvfKL7uAdlDAUSJ1TYC_3tSCoNYBPVmFE0RKPrTMeDwNWsYgABP9spOpeqNckdlCbQ7Sg1rcP-BJb6fVmz0FxizDi7ODUFrjNtp5sdGXYeeQtoSI9pXHrInxvDJpwsQ_6BKqZvcQCms74kqGVhW24zNl1hjfltTnPb9z-F_hC7lhC4gZch4x_5d6ZoEEbrvnGDQLAze_kq1i1Ol6MlwmHZk",
  },
];

const voices = [
  {
    quote: "The Robotics Club didn't just teach me how to build machines; it taught me how to think critically and solve real-world problems with my team.",
    author: "Ahmed Z.",
    meta: "Grade 12, Robotics Lead",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxTTGtrQOl9DoUclZtte5a4GZjcNBggzCWvRoQTW9PSYXLw06enfR-_rAdw-wfH0XWNABbjdJI3npqqukH8FB03pOT2dVSMA0K8ji_Yw32qWTBDT4K21asg6jqlnaJh76Gq5SUNUnkjlWpAUKVKVPkBgRbIqwltrZ3QMxcmzavhpcDNv3a_NYj4EBgK-ZWi3p537ey-kEtpLUeQL3_eGGY6ytUUBwxGHe3tiEwnW-JcyAFkCb5HhA3XY6MW8DhFVg8V8bl4KXXcbQ",
    color: "border-[#7c3aed]",
  },
  {
    quote: "Being part of the Leadership Council gave me the confidence to start my own community initiative. Basaeer truly empowers us to lead.",
    author: "Sara M.",
    meta: "Grade 11, Council President",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmYk0YWq1pG9KJaE_7dG_v4Td6wsb7x46gIWwYMFYJ6acGBcrkocrWPxTSwqASVy_zJcL2dW0UcxdqKAmVqpclBWwfPJCY6ILCtMORJ6N6EoP0S8MiF5NhN05d5gIdeOXrnllo3yOfxVsHgbZdw3QwAW-iFWAbzkseV4R8aaxrnQP1BiL4AcoTMyuJIqe-ebBK45vdnstM2RE_AgAOLfgBOFHLr-88MFCUbOmgLk2WnUcXTVrOpnSeU1eC9HfhhHdbisAhRyflcsk",
    color: "border-[#adc6ff]",
  },
  {
    quote: "Reciting in the International Quran Competition was a life-changing experience. The mentorship here is unparalleled.",
    author: "Omar K.",
    meta: "Grade 10, Tahfeez Member",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2ix303pCKr75EMDJcJ1x-0cVnc49sYssJcVOLgEEwF8adp8G_t2cJsKS_1mmTv-Zf6zlwi92VbXfY1AveHLFL5SM_2cbJlYVSxWntpZincxCqsmYTlHgctqvxYf_vCoXKAuPY9jJXQ4uJjjMQgdcHPSKtKzEcwDITDrR-1ayxcS9RHiPMSGMok5Ayo9aO7icSmWXeoQBC-TamNJWGDy7XnlUjieLeZPAEgPINrJLGP3A2DnkNGlh-isaUPp-wO_uEP07ngsrFVnc",
    color: "border-[#7c3aed]",
  },
];

export default function StudentLifePage() {
  return (
    <div className="relative min-h-screen bg-[#15121b] text-[#e8dfee] font-sans selection:bg-[#7c3aed]/20 overflow-hidden">
      {/* Moving Aurora Backdrop */}
      <GradientBackground />

      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[#d2bbff] font-bold text-xs tracking-widest uppercase block">
                STUDENT EXPERIENCE
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-none text-white font-heading">
                Beyond the Classroom: Where <span className="text-[#d2bbff] drop-shadow-[0_0_15px_rgba(210,187,255,0.4)]">Character</span> is Built.
              </h1>
              <p className="text-[#ccc3d8] text-lg md:text-xl leading-relaxed max-w-xl">
                At Basaeer, we cultivate the leaders of tomorrow through a vibrant tapestry of arts, sports, and spiritual growth. Discover your potential in an environment that celebrates every talent.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-all duration-300">
                  Explore Clubs
                </button>
                <button className="px-8 py-4 rounded-full text-[#e8dfee] font-bold bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                  View Calendar
                </button>
              </div>
            </div>

            {/* Collage Section */}
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  className="rounded-3xl shadow-2xl w-full aspect-[3/4] object-cover border border-white/5" 
                  alt="Students working on collaborative projects" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvh0k6lscNR7bbMVdfAJatzV-DiMP_ZqkfJzrlNHrRmHdjF9ZoExmwUSyRftDyOV6DF6ghLZdRDB9BpxbbQVf1Of_i0ePI5KJ4kDXW3C5QdID0STCsDAZUDInmKuZGTAPGZCSFPLcmJk0xZb8HGu2jhcwFfxQFbpR6c6tzFNu59l2oYZO7aMZBr5Fxn34VXR65szhiMcQ3fLfKSES3mUehUvt-vwTx2XX3-Y0LZWUbtePDd2zPVluVkHLMkKUER9FoP2NC7X0pMKM"
                />
                <img 
                  className="rounded-3xl shadow-2xl w-full aspect-square object-cover border border-white/5" 
                  alt="Student coding on laptop" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEEdPErMXhlORsd-Pp9fVUub4ZOTBVaKHdK_qi4lFnhHmhjedxEhgxd_-gpp5hi2cCDUlMxFm6FovWp62fKDxcjEx1lO6Ry9Asa3JrUw-VMrne10l7FoRNZmLRMsApxnPfVBYQJ62QrOq-BrPQdMMLgHZn7lrRiQ50DN5DXRfnpJnf8SVIkItrGYxlQsfz94JqvxrbrqTwnPbFkf6FWBHnYy8eIRyUKGsu7e_tYVHrCLmOqKEuDmdB6KypZwKzOXSr0JGZ5y5DtWQ"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img 
                  className="rounded-3xl shadow-2xl w-full aspect-square object-cover border border-white/5" 
                  alt="Student athlete in action" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGxJBmwFo8QPGO6Bb5vj8UHwpV81XOGhAX0lQxPhc90g2iBw7-nQqbk-PPsCsn0FsY0G8xCz8a5_1jjzep9LxF3oqMvgm_YHlbmvVNZw4U0sQpPioZS9R2jEtjofVMWkfRMn80LqLJVC2TtDlx_fE_6YZSuFo8RB1Kc9Tv0ZXsiDt8JoHq86trAhNUrjy8FAtfipWFlpnoZJtuZVrQ64KGS70vb07LwjEeGn52svCoga8PblRY3kY98Pv39Y9u97CZtj25xnAy7As"
                />
                <img 
                  className="rounded-3xl shadow-2xl w-full aspect-[3/4] object-cover border border-white/5" 
                  alt="Students engaged in a leadership seminar" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB238EPWwo8XCC9Vc7O1oXAKNrFYloNpDBsg7jWbeAbaluyNzRDZ3xblobIU2XlY7g4JUJe2pkN33SFdex0Ts9CMXuNBzLhJK3qidA5HqYsiupPxnHSV6ziFZ03I_0roJWH1kYIPDoIpEuwlEKYAQwuXmniX3_LNZOcyHnnWDeVH_K2sehNyeA0GLjlv9EoUBhnPAF0BUraSsz9kzZ1l8fp3fg4ozgnWG8WHLosYuNcFr_TGB1yc_hMmTnPg0uwhxvWDwVCIp72QCc"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Clubs & Societies Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading">
              Clubs &amp; Societies
            </h2>
            <p className="text-lg text-[#ccc3d8] max-w-2xl mx-auto">
              Nurture your passions through our diverse range of extracurricular pathways, guided by industry experts and mentors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-8 h-auto md:h-[600px]">
            {/* Science Club */}
            <div className="md:col-span-2 md:row-span-2 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#7c3aed]/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-end relative overflow-hidden group">
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500" 
                alt="Advanced chemistry laboratory" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSti_i7L6BaLwZqxIgQ6Dq3lu4HA1s4dMl0pnOorWsaeBGsfVzwIIt91chLMllpsvvW4h2SrGdX-bdEgTZtYGSA6Pzan-ZvxdF5JEMnD9LyLXkvZ-OexjW63eAhbC86Uz43sk4yLlGzLCGU-EkyktZjlhc8v3BFtt4JlD7ZMFvo9jYX4gScmzNMIPwTXc5pITEIyobb0Blop8Jbbr0gqPV5IkbwdFzFiKlCuayDdVd2L7PP_c20kjeR4f7A0ZdZECvPIv31KZgArQ"
              />
              <div className="relative z-10 space-y-4">
                <Atom className="text-[#d2bbff] w-12 h-12" />
                <h3 className="text-3xl font-bold text-white font-heading">
                  Science Club
                </h3>
                <p className="text-[#ccc3d8] text-base leading-relaxed">
                  Exploring the frontiers of robotics, biotechnology, and experimental physics with cutting-edge laboratory facilities.
                </p>
                <button className="text-[#d2bbff] flex items-center gap-2 font-bold uppercase tracking-wider text-sm hover:text-white transition-colors">
                  LEARN MORE <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Arts & Calligraphy */}
            <div className="md:col-span-2 bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#7c3aed]/30 hover:shadow-2xl transition-all duration-300 flex items-center gap-8 group overflow-hidden">
              <div className="flex-1 space-y-3">
                <Palette className="text-[#d2bbff] w-8 h-8" />
                <h3 className="text-2xl font-bold text-white font-heading">
                  Arts &amp; Calligraphy
                </h3>
                <p className="text-[#ccc3d8] text-sm leading-relaxed">
                  Blending traditional Islamic arts with digital design and modern fine art techniques.
                </p>
              </div>
              <div className="w-1/3 h-full rounded-2xl overflow-hidden border border-white/10 shrink-0">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Traditional Arabic calligraphy" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdOVSNPLkaQuJTZ1X2g_Nr_x88sCJ1l8mMPLd4vrsqjfkHEf-FJfupEwnJM8fnRXd8B_c5zEIVUdKZEFGgu9l6m4TywSbQrlxq1MfEsX-XuOzIJluk1UTQKkrFHNRaTrHeTOvHphlFzmj5_-FD3CzlDTvCdtNPgwQLn9zUTkOVvCS-CGDvOaoe_jJP52VkI8l6HIf0NQq65O7DUCTl82sTNVBY3ZhQUImzmnEAcMcWqF1aSSfKd5m3U3fb_TLGTjDHsNX-kTx1i38"
                />
              </div>
            </div>

            {/* Sports Academy */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#7c3aed]/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-center text-center items-center space-y-3 group">
              <Trophy className="text-[#d2bbff] w-12 h-12" />
              <h3 className="text-xl font-bold text-white font-heading">
                Sports Academy
              </h3>
              <p className="text-[#ccc3d8] text-sm leading-relaxed">
                Elite training in football, tennis, and swimming for national level competition.
              </p>
            </div>

            {/* Leadership Council */}
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#7c3aed]/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-center text-center items-center space-y-3 group">
              <Users className="text-[#d2bbff] w-12 h-12" />
              <h3 className="text-xl font-bold text-white font-heading">
                Leadership Council
              </h3>
              <p className="text-[#ccc3d8] text-sm leading-relaxed">
                Empowering the next generation of ethical leaders through civic engagement.
              </p>
            </div>
          </div>
        </section>

        {/* Annual Events Grid */}
        <section className="py-24 bg-[#100d16]/40 mb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight font-heading">
                  Annual Events
                </h2>
                <p className="text-lg text-[#ccc3d8]">
                  The highlights of our academic year, where excellence meets celebration.
                </p>
              </div>
              <button className="text-[#d2bbff] font-bold uppercase tracking-wider text-sm border-b border-[#7c3aed] pb-1 hover:text-white transition-colors shrink-0">
                VIEW FULL CALENDAR
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((evt) => (
                <div
                  key={evt.title}
                  className={`bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border group transition-all duration-300 ${
                    evt.featured 
                      ? "border-[#7c3aed]/50 shadow-[0_0_20px_rgba(124,58,237,0.15)] md:scale-105" 
                      : "border-white/10 hover:border-[#7c3aed]/30"
                  }`}
                >
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={evt.title} 
                      src={evt.image}
                    />
                    <div className="absolute top-4 right-4 bg-[#7c3aed] px-3 py-1 rounded font-bold text-[10px] text-white tracking-widest uppercase">
                      {evt.date}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h4 className="text-xl font-bold text-white font-heading group-hover:text-[#d2bbff] transition-colors">
                      {evt.title}
                    </h4>
                    <p className="text-[#ccc3d8] text-sm leading-relaxed">
                      {evt.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#d2bbff] font-semibold pt-2 border-t border-white/5">
                      <MapPin size={14} /> {evt.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Excursions & Field Trips */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white font-heading mb-16">
            Global Explorations
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white/5 backdrop-blur-md p-4 rounded-3xl relative group overflow-hidden border border-white/10 flex flex-col justify-end min-h-[400px]">
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" 
                alt="Students exploring historic Istanbul" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBiNVvavsxKJnXPed5VzVySoKcojTq7NXqKkVxtACHXbvlroNYNhD7EGmXLF_KaCyDAUoXjyLrOXVaZvfCYutVI0Eo8bV55dBKRFH2Ta1dBx_DLQE8ottmds1hnpfrpNrcBM4H7P86TgSkYi7JH-Ina5891YM5zZcfq3EM1X30bDy2qYw4t76--LCIk71yAQdZR6mVR2vHvNIRj6NzN0ZLsTgILP2mxJbKHL0z8dcaXBaFk4VAaYKof_BzhwKP4AkXIEfLoH7mLLY"
              />
              <div className="relative z-10 p-6 space-y-3">
                <div className="text-[#d2bbff] font-bold text-xs tracking-widest uppercase">
                  UPCOMING
                </div>
                <h4 className="text-2xl md:text-3xl font-bold text-white font-heading">
                  Istanbul: History &amp; Heritage
                </h4>
                <p className="text-[#ccc3d8] text-sm max-w-md leading-relaxed">
                  An immersive 10-day journey through the Ottoman history and modern architectural wonders of Turkey.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/3 space-y-4">
              {sideTrips.map((trip) => (
                <div 
                  key={trip.title}
                  className="bg-white/5 backdrop-blur-md p-4 rounded-2xl flex gap-4 items-center group cursor-pointer border border-white/10 hover:border-[#7c3aed]/30 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/5">
                    <img className="w-full h-full object-cover" alt={trip.title} src={trip.image} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-base font-bold text-white font-heading">
                      {trip.title}
                    </h5>
                    <p className="text-xs text-[#ccc3d8] font-semibold uppercase tracking-wider">
                      {trip.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Voices */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white font-heading mb-16">
            Student Voices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {voices.map((v) => (
              <div 
                key={v.author} 
                className={`bg-white/5 backdrop-blur-md p-8 rounded-3xl relative border-t-4 ${v.color} border-l border-r border-b border-white/5 hover:border-[#7c3aed]/20 transition-all duration-300 flex flex-col justify-between`}
              >
                <p className="text-lg italic text-[#e8dfee] leading-relaxed mb-8">
                  &quot;{v.quote}&quot;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#7c3aed]/50 shrink-0">
                    <img className="w-full h-full object-cover" alt={v.author} src={v.image} />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white font-heading">{v.author}</div>
                    <div className="text-xs text-[#ccc3d8] font-semibold">{v.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
