export const campuses = [
  { name: "Kaduna", slug: "kaduna", tagline: "The Premier Knowledge City", students: "3,200+", founded: "2010", programs: "14+" },
  { name: "Jos", slug: "jos", tagline: "The Hilltop Center of Excellence", students: "1,800+", founded: "2014", programs: "10+" },
  { name: "Kano", slug: "kano", tagline: "The Ancient Seat of Learning", students: "2,500+", founded: "2012", programs: "12+" },
  { name: "Bauchi", slug: "bauchi", tagline: "The Gateway to Wisdom", students: "1,200+", founded: "2018", programs: "8+" },
];

export const sections = [
  { name: "Tahfeez", slug: "tahfeez", description: "Quranic Memorization & Tajweed" },
  { name: "Primary", slug: "primary", description: "Foundational Academic Excellence" },
  { name: "Secondary", slug: "secondary", description: "College & Career Preparation" },
  { name: "Nursery", slug: "nursery", description: "Early Childhood Development" },
  { name: "Adult Education", slug: "adult-education", description: "Lifelong Learning Opportunities" },
];

const PLACEHOLDER = "/placeholder.svg";

export const campusImages: Record<string, string> = {
  kaduna: PLACEHOLDER,
  jos: PLACEHOLDER,
  kano: PLACEHOLDER,
  bauchi: PLACEHOLDER,
};

export const sectionImages: Record<string, string> = {
  tahfeez: PLACEHOLDER,
  primary: PLACEHOLDER,
  secondary: PLACEHOLDER,
  nursery: PLACEHOLDER,
  "adult-education": PLACEHOLDER,
};

export const campusDescriptions: Record<string, string> = {
  kaduna: "Our flagship campus in the heart of Kaduna, featuring state-of-the-art science laboratories, a dedicated Tahfeez center, and expansive sports facilities. This campus serves as the model for academic excellence across our network.",
  jos: "Nestled in the serene hills of Jos, this campus offers a tranquil environment ideal for deep learning and spiritual reflection. Known for its strong STEM program and beautiful natural surroundings.",
  kano: "Located in the historic city of Kano, this campus blends traditional Islamic scholarship with modern technology. Features a world-class Islamic studies center and digital innovation lab.",
  bauchi: "Situated in the beautiful landscape of Bauchi, our newest campus combines modern educational facilities with a focus on environmental sustainability and community engagement.",
};

export const campusFeatures: Record<string, { icon: string; label: string; value: string }[]> = {
  kaduna: [
    { icon: "GraduationCap", label: "Students", value: "3,200+" },
    { icon: "BookOpen", label: "Programs", value: "14+" },
    { icon: "Calendar", label: "Founded", value: "2010" },
    { icon: "Award", label: "Graduates", value: "4,500+" },
  ],
  jos: [
    { icon: "GraduationCap", label: "Students", value: "1,800+" },
    { icon: "BookOpen", label: "Programs", value: "10+" },
    { icon: "Calendar", label: "Founded", value: "2014" },
    { icon: "Award", label: "Graduates", value: "2,200+" },
  ],
  kano: [
    { icon: "GraduationCap", label: "Students", value: "2,500+" },
    { icon: "BookOpen", label: "Programs", value: "12+" },
    { icon: "Calendar", label: "Founded", value: "2012" },
    { icon: "Award", label: "Graduates", value: "3,100+" },
  ],
  bauchi: [
    { icon: "GraduationCap", label: "Students", value: "1,200+" },
    { icon: "BookOpen", label: "Programs", value: "8+" },
    { icon: "Calendar", label: "Founded", value: "2018" },
    { icon: "Award", label: "Graduates", value: "900+" },
  ],
};

export const campusHighlights: Record<string, string[]> = {
  kaduna: [
    "Advanced STEM laboratories with cutting-edge equipment",
    "Dedicated Tahfeez center with certified Qaris",
    "Olympic-standard sports complex",
    "Smart classrooms with interactive technology",
    "Residential facilities for boarding students",
  ],
  jos: [
    "Scenic hilltop campus with modern architecture",
    "Strong emphasis on environmental sciences",
    "Digital innovation and robotics lab",
    "Peaceful learning environment",
    "Close-knit community of learners",
  ],
  kano: [
    "Historic city location with rich Islamic heritage",
    "World-class Islamic studies center",
    "Digital innovation and AI research lab",
    "Partnerships with leading universities",
    "Comprehensive library with digital archives",
  ],
  bauchi: [
    "Modern eco-friendly campus design",
    "Community-integrated learning programs",
    "Agricultural and environmental research",
    "Affordable quality education",
    "Growing alumni network",
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
    ageRange: "6 - 18 years",
    duration: "3 - 7 years",
    highlights: [
      "One-on-one Quranic memorization with certified Qaris",
      "Tajweed mastery and Makharij articulation",
      "Daily Sabaq, Sabqi, and Manzil review system",
      "Ijazah certification upon completion",
      "Integration with full academic curriculum",
    ],
    curriculum: [
      "Hifz al-Quran — Systematic memorization",
      "Tajweed Rules — Precision in recitation",
      "Tafsir — Understanding the meaning",
      "Arabic Language — Foundational linguistics",
      "Tarbiyah — Character development",
    ],
    outcomes: [
      "Complete Quran memorization with Ijazah",
      "Mastery of Tajweed and proper recitation",
      "Strong Arabic language foundation",
      "Deep spiritual connection and discipline",
      "Seamless integration with mainstream academics",
    ],
  },
  primary: {
    ageRange: "6 - 11 years",
    duration: "6 years",
    highlights: [
      "British International Curriculum (Cambridge)",
      "Islamic Studies and Arabic language integration",
      "STEM foundation with hands-on lab experience",
      "Character development and leadership skills",
      "Extracurricular activities including sports and arts",
    ],
    curriculum: [
      "English, Mathematics, Science — Core subjects",
      "Islamic Studies — Aqeedah, Fiqh, Seerah",
      "Arabic Language — Reading, writing, conversation",
      "ICT & Digital Literacy — Computer fundamentals",
      "Creative Arts — Music, art, and drama",
    ],
    outcomes: [
      "Strong foundation in core academic subjects",
      "Fluent Arabic reading and basic conversation",
      "Memorization of key Quranic chapters",
      "Developed critical thinking and problem-solving",
      "Preparation for secondary education",
    ],
  },
  secondary: {
    ageRange: "11 - 16 years",
    duration: "6 years",
    highlights: [
      "Cambridge IGCSE and A-Level preparation",
      "Advanced STEM laboratories and research projects",
      "University counseling and career guidance",
      "Community service and leadership programs",
      "Tahfeez continuation track available",
    ],
    curriculum: [
      "Cambridge IGCSE — Sciences, Mathematics, Languages",
      "A-Level Preparation — Specialized subjects",
      "Islamic Studies — Advanced Fiqh, Tafsir, Hadith",
      "Leadership & Ethics — Civic responsibility",
      "Research Methods — Scientific inquiry skills",
    ],
    outcomes: [
      "Cambridge IGCSE and A-Level certifications",
      "University-ready academic standing",
      "Strong moral and ethical framework",
      "Leadership and community service experience",
      "Clear career and academic pathway",
    ],
  },
  nursery: {
    ageRange: "3 - 5 years",
    duration: "3 years",
    highlights: [
      "Play-based learning in a nurturing environment",
      "Quranic introduction and Arabic immersion",
      "Montessori-inspired pedagogy",
      "Social, emotional, and cognitive development",
      "Safe and stimulating campus facilities",
    ],
    curriculum: [
      "Early Literacy — Pre-reading and writing skills",
      "Numeracy — Counting, shapes, patterns",
      "Quranic Introduction — Short surahs and supplications",
      "Arabic Immersion — Basic vocabulary and phrases",
      "Creative Play — Art, music, and movement",
    ],
    outcomes: [
      "School-readiness in literacy and numeracy",
      "Familiarity with Quranic verses and duas",
      "Social confidence and emotional resilience",
      "Curiosity-driven love for learning",
      "Smooth transition to primary education",
    ],
  },
  "adult-education": {
    ageRange: "18+ years",
    duration: "Flexible",
    highlights: [
      "Evening and weekend classes available",
      "Quranic studies and Arabic language",
      "Vocational and professional development",
      "Flexible scheduling for working professionals",
      "Certification and diploma programs",
    ],
    curriculum: [
      "Quranic Studies — Recitation, Tajweed, Tafsir",
      "Arabic Language — Beginners to advanced",
      "Islamic Sciences — Fiqh, Aqeedah, Seerah",
      "Professional Skills — ICT, communication",
      "Vocational Training — Tailored programs",
    ],
    outcomes: [
      "Enhanced Quranic recitation and understanding",
      "Arabic language proficiency",
      "Professional skill certification",
      "Personal and spiritual growth",
      "Community leadership readiness",
    ],
  },
};

export const sectionIcons: Record<string, string> = {
  tahfeez: "BookOpen",
  primary: "GraduationCap",
  secondary: "Award",
  nursery: "Heart",
  "adult-education": "Users",
};
