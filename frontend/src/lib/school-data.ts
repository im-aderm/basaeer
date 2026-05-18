export const campuses = [
  {
    name: "Kaduna",
    slug: "kaduna",
    tagline: "Headquarters & Girls College",
    students: "Official figures pending",
    founded: "2021",
    programs: "BQSC + Tahfeez (Day & Boarding)",
    isHQ: true,
  },
  {
    name: "Kano",
    slug: "kano",
    tagline: "Boys Boarding Campuses",
    students: "Official figures pending",
    founded: "2021",
    programs: "Two-Year Tahfeez Boarding",
    campuses: "Al-Areefi Institute & Birrul Walidain Complex",
  },
  {
    name: "Plateau",
    slug: "plateau",
    tagline: "Day Programs",
    students: "Official figures pending",
    founded: "2021",
    programs: "Quranic Memorization School",
  },
  {
    name: "Bauchi",
    slug: "bauchi",
    tagline: "Arrayyan Learning Centre",
    students: "Official figures pending",
    founded: "2021",
    programs: "Nursery, Primary, Secondary + Tahfeez",
    isALC: true,
  },
];

export const sections = [
  { name: "Tahfeez", slug: "tahfeez", description: "Quranic Memorization & Tajweed" },
  { name: "Primary", slug: "primary", description: "Foundational Academic Excellence (ALC Bauchi)" },
  { name: "Secondary", slug: "secondary", description: "College Preparation — BQSC Kaduna" },
  { name: "Nursery", slug: "nursery", description: "Early Childhood Development (ALC Bauchi)" },
];

const PLACEHOLDER = "/placeholder.svg";

export const campusImages: Record<string, string> = {
  kaduna: PLACEHOLDER,
  kano: PLACEHOLDER,
  plateau: PLACEHOLDER,
  bauchi: PLACEHOLDER,
};

export const sectionImages: Record<string, string> = {
  tahfeez: PLACEHOLDER,
  primary: PLACEHOLDER,
  secondary: PLACEHOLDER,
  nursery: PLACEHOLDER,
};

export const campusDescriptions: Record<string, string> = {
  kaduna:
    "Our flagship headquarters campus in Kaduna State, home to the girls-only Basa'er Qur'anic & Science College (BQSC). Offers science-focused academics integrated with Qur'anic memorization, deep Islamic studies, and a separate two-year Tahfeez program for girls in a boarding environment. Also hosts BQMS Day Programs for boys and girls ages 5–25. Founded: 22 September 2021.",
  kano:
    "Two dedicated boys boarding campuses in Kano State: Al-Areefi Institute and Birrul Walidain Complex. Both offer intensive two-year Qur'an memorization programs in a structured boarding environment, combining spiritual discipline with academic and vocational development. Founded: 2021.",
  plateau:
    "Basa'er Qur'anic Memorization School (BQMS) in Plateau State, offering Qur'an memorization and Islamic studies programs for boys and girls in a day-school format. Part of the institution's mission to reach underserved communities across northern Nigeria.",
  bauchi:
    "Arrayyan Learning Centre (ALC) LTD/GTE in Anguwar Rana, Tilden Fulani, Toro Local Government, Bauchi State. A sister institution serving a needy and less privileged community. Provides nursery, primary, and secondary education integrating Western academics with Arabic and Islamic studies alongside a Tahfeez Program. This location requires urgent funding support.",
};

export const campusFeatures: Record<string, { icon: string; label: string; value: string }[]> = {
  kaduna: [
    { icon: "Star", label: "Status", value: "Headquarters" },
    { icon: "GraduationCap", label: "Focus", value: "Girls BQSC College" },
    { icon: "BookOpen", label: "Programs", value: "Day & Boarding" },
    { icon: "Calendar", label: "Founded", value: "2021" },
  ],
  kano: [
    { icon: "Building2", label: "Campuses", value: "2 (Boys Boarding)" },
    { icon: "GraduationCap", label: "Focus", value: "Two-Year Tahfeez" },
    { icon: "BookOpen", label: "Type", value: "Full Boarding" },
    { icon: "Calendar", label: "Founded", value: "2021" },
  ],
  plateau: [
    { icon: "Building2", label: "Campus", value: "Day School" },
    { icon: "GraduationCap", label: "Focus", value: "Quranic Memorization" },
    { icon: "BookOpen", label: "Programs", value: "BQMS Day" },
    { icon: "Calendar", label: "Founded", value: "2021" },
  ],
  bauchi: [
    { icon: "Building2", label: "Type", value: "ALC — Sister Institution" },
    { icon: "GraduationCap", label: "Focus", value: "Nursery–Secondary" },
    { icon: "BookOpen", label: "Programs", value: "Academic + Tahfeez" },
    { icon: "Calendar", label: "Founded", value: "2021" },
  ],
};

export const campusHighlights: Record<string, string[]> = {
  kaduna: [
    "Girls-only Qur'anic & Science College (BQSC) with boarding",
    "Day programs for boys and girls (BQMS)",
    "Science labs, Islamic studies, vocational training (IT, fashion, catering)",
    "Separate two-year Tahfeez program for girls",
    "Director General's office",
  ],
  kano: [
    "Intensive two-year Qur'an memorization (Tahfeez) boarding program",
    "Two campuses: Al-Areefi Institute & Birrul Walidain Complex",
    "Boys-only boarding with structured Islamic environment",
    "Academic integration alongside memorization",
    "Deputy Director's office",
  ],
  plateau: [
    "Qur'an memorization and Islamic studies (BQMS Day)",
    "Serving underserved communities in Plateau State",
    "Boys and girls programs",
    "Part of nationwide Waqf mission",
  ],
  bauchi: [
    "Full nursery, primary, and secondary education",
    "Western academics + Arabic + Islamic studies",
    "Tahfeez program (BQMS)",
    "Serving a needy, less privileged community",
    "Urgent funding and support needed",
    "Operated under Arrayyan Learning Centre (ALC) LTD/GTE",
  ],
};

export const sectionDetails: Record<string, {
  ageRange: string;
  duration: string;
  highlights: string[];
  curriculum: string[];
  outcomes: string[];
}> = {
  tahfeez: {
    ageRange: "5–25 years",
    duration: "2-Year Intensive / Part-Time",
    highlights: [
      "Full Qur'an memorization (Hifdh) with certified Huffādh instructors",
      "Daily Tajweed and recitation practice with individual correction",
      "Progressive memorization tracking and regular assessment",
      "Islamic studies integration — Aqeedah, Fiqh, Seerah, and Akhlaq",
      "Boarding option available (Kano boys, Kaduna girls)",
      "Advanced Muraja'a & Itqan programs for graduates",
    ],
    curriculum: [
      "Qur'an Memorization (Hifdh) — structured daily targets",
      "Tajweed Theory & Practice — rules of recitation",
      "Islamic Studies — Aqeedah, Tafsir, Fiqh, Hadith, Seerah",
      "Arabic Language — reading, writing, comprehension",
      "Tarbiyya wal Akhlaq — character and moral development",
    ],
    outcomes: [
      "Complete Qur'an memorization with certified Ijazah",
      "Mastery of Tajweed rules and proper recitation",
      "Solid foundation in Islamic sciences",
      "Character grounded in Qur'anic values",
      "Eligibility for advanced Qira'at and Itqan programs",
    ],
  },
  primary: {
    ageRange: "5–11 years",
    duration: "6-Year Program",
    highlights: [
      "Nigerian primary curriculum integrated with Arabic and Islamic studies",
      "Foundational literacy, numeracy, and science education",
      "Early Qur'an memorization program",
      "Safe, nurturing learning environment",
      "Currently available at ALC Bauchi",
    ],
    curriculum: [
      "English Language & Literacy",
      "Mathematics & Numeracy",
      "Basic Science & Technology",
      "Social Studies & Civic Education",
      "Arabic Language (reading and writing)",
      "Qur'an Memorization (age-appropriate)",
      "Islamic Studies & Akhlaq",
    ],
    outcomes: [
      "Strong foundation in core academic subjects",
      "Arabic reading and writing proficiency",
      "Early-stage Qur'an memorization progress",
      "Islamic character and moral values",
      "Prepared for secondary school entry",
    ],
  },
  secondary: {
    ageRange: "12–18 years",
    duration: "6-Year Program (JSS + SSS)",
    highlights: [
      "Nigerian secondary curriculum with science focus",
      "Integrated Qur'an memorization program (3–4 years for BQSC)",
      "Arabic language and deep Islamic studies",
      "Mandatory vocational skills training (IT, fashion, catering, etc.)",
      "Boarding available at Kaduna (girls) and Kano (boys)",
      "Preparation for WAEC, NECO, and higher education",
    ],
    curriculum: [
      "English Language & Literature",
      "Mathematics (General & Further)",
      "Sciences — Biology, Chemistry, Physics",
      "Arabic Language (advanced)",
      "Islamic Studies — Aqeedah, Tafsir, Fiqh, Hadith",
      "Qur'an Memorization (Hifdh)",
      "Vocational Skills — IT, Fashion Design, Catering, Entrepreneurship",
      "Civic Education & Leadership",
    ],
    outcomes: [
      "WAEC/NECO certification for higher education entry",
      "Complete or partial Qur'an memorization",
      "Proficiency in Arabic language",
      "Practical vocational skills for career readiness",
      "Islamic character and leadership development",
      "Prepared for university (local or international)",
    ],
  },
  nursery: {
    ageRange: "3–5 years",
    duration: "2-Year Early Childhood Program",
    highlights: [
      "Play-based early childhood education",
      "Introduction to Arabic letters and sounds",
      "Qur'an listening and basic surah memorization",
      "Social and emotional development",
      "Currently available at ALC Bauchi",
    ],
    curriculum: [
      "Early Literacy & Numeracy",
      "Creative Arts & Play",
      "Arabic Letters & Sounds",
      "Basic Surah Memorization",
      "Social & Emotional Learning",
      "Physical Development",
    ],
    outcomes: [
      "School readiness for primary education",
      "Basic Arabic letter recognition",
      "Memorization of short Qur'anic surahs",
      "Social confidence and emotional regulation",
    ],
  },
};
