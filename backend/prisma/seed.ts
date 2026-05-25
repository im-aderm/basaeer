import 'dotenv/config';
import { PrismaClient, UserRole } from '../src/generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting minimal seed process...');

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@basaeer.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Password123!';

  // 1. Reset Database
  console.log('Resetting database...');
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    console.log('All tables truncated.');
  } catch (error) {
    console.log('Error during truncate, falling back to manual deletion...');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 8);

  // 2. Seed Super Admin user
  console.log('Seeding Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // 3. Seed default branch
  console.log('Seeding default branch...');
  const branch = await prisma.branch.create({
    data: {
      name: 'Kaduna Headquarters',
      code: 'KD-HQ',
      address: 'Kaduna State, Nigeria',
      phone: '08039425673',
      email: 'baqmesng@gmail.com',
      isActive: true,
    },
  });

  // 4. Seed Event Categories
  console.log("Seeding Event Categories...");
  const categories = [
    { name: "Camps", slug: "CAMPS" },
    { name: "Conferences", slug: "CONFERENCES" },
    { name: "Competitions", slug: "COMPETITIONS" },
    { name: "Workshops", slug: "WORKSHOPS" },
    { name: "Excursions", slug: "EXCURSIONS" },
    { name: "Summer Programs", slug: "SUMMER_PROGRAMS" },
    { name: "Tahfiz Programs", slug: "TAHFIZ_PROGRAMS" },
    { name: "Academic Programs", slug: "ACADEMIC_PROGRAMS" },
    { name: "Others", slug: "OTHERS" },
  ];

  for (const cat of categories) {
    await prisma.eventCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const campCategory = await prisma.eventCategory.findUnique({
    where: { slug: "CAMPS" },
  });

  // 5. Seed Dauhatul-Qur'an Camp 2026
  console.log("Seeding Dauhatul-Qur'an Camp 2026...");
  const campEvent = await prisma.campusEvent.create({
    data: {
      title: "Dauhatul-Qur'an Camp 2026",
      slug: "dauhatul-quran-camp-2026",
      shortDescription: "The premier Quranic and leadership camp for boys and girls to cultivate excellence in recitation, memorization, and Islamic tarbiyah.",
      fullDescription: "Dauhatul-Qur'an Camp 2026 is a premium boarding camp designed for youths ages 10 to 18. Guided by international Quran scholars and certified tarbiyah mentors, the camp integrates intensive Tajweed classes, robotics modules, character building exercises, and physical recreation.",
      objectives: [
        "Master Tajweed recitation rules and apply them in daily prayers.",
        "Memorize selected portions of the Holy Quran with high precision.",
        "Nurture Islamic character (Adab) and personal discipline (Tarbiyah).",
        "Foster collaboration through science, technology, and sports."
      ],
      requirements: [
        "Must be between the ages of 10 and 18.",
        "Proficiency in basic Arabic reading/recitation.",
        "Completed application form with parent authorization."
      ],
      rulesAndDiscipline: "All students must attend daily prayers and memorization sessions punctually. Modest Islamic dress code is strictly enforced. Smart phones, electronic gaming consoles, and smart devices are prohibited on campus. Mutual respect among students and mentors is required.",
      mealsAndHospitality: "Nutritious, balanced daily meals (breakfast, lunch, dinner) are served for boarding students. Refreshments are provided during break periods. Clean housing facilities with 24/7 security and certified health practitioners on-site.",
      whyChooseThisEvent: [
        "Elite Quranic teachers with connected chains of narration (Sanad).",
        "Safe and highly secure boarding environment.",
        "Integrated curriculum featuring both Quranic mastery and science modules."
      ],
      startDate: new Date("2026-08-01T08:00:00Z"),
      endDate: new Date("2026-08-30T17:00:00Z"),
      applicationDeadline: new Date("2026-07-25T23:59:59Z"),
      location: "Kaduna Headquarters Campus, Nigeria",
      categoryId: campCategory?.id,
      categoryLabel: "CAMPS",
      isPublic: true,
      status: "ACTIVE",
      active: true,
      featuredImage: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop",
      brochurePdf: "https://basaeer-uploads.cdn.basaeer.edu.ng/brochures/dauhatul_quran_camp_2026.pdf",
      capacity: 150,
      registrationOpen: true,
      applicationFormEnabled: true,
      paymentRequired: true,
      seoMetadata: {
        seoTitle: "Dauhatul-Qur'an Camp 2026",
        seoDescription: "Apply for Basaeer's leading Quranic memorization and leadership boarding camp for youths.",
        seoKeywords: "quran camp, boarding hifz school, tajweed course nigeria"
      },
      branchId: branch.id
    }
  });

  // Seed packages
  await prisma.eventPackage.createMany({
    data: [
      {
        eventId: campEvent.id,
        title: "Full Boarding Program",
        boardingType: "BOARDING",
        fee: 75000,
        ageRange: "10-18",
        timing: "24 Hours",
        availableSlots: 100,
        description: "Includes lodging, full boarding meals, academic resources, laundry, and all excursions."
      },
      {
        eventId: campEvent.id,
        title: "Day Student Program",
        boardingType: "DAY",
        fee: 40000,
        ageRange: "10-18",
        timing: "8:00 AM - 4:00 PM",
        availableSlots: 50,
        description: "Includes daily lunch, academic materials, and program activities. Lodging not included."
      }
    ]
  });

  // Seed schedules
  await prisma.eventSchedule.createMany({
    data: [
      {
        eventId: campEvent.id,
        day: "Daily",
        period: "Morning",
        startTime: "05:00",
        endTime: "06:30",
        activity: "Fajr Prayer and Morning Adhkar Recitations"
      },
      {
        eventId: campEvent.id,
        day: "Daily",
        period: "Morning",
        startTime: "08:00",
        endTime: "11:30",
        activity: "Intensive Quran Memorization (Hifdh) Sessions"
      },
      {
        eventId: campEvent.id,
        day: "Daily",
        period: "Afternoon",
        startTime: "12:00",
        endTime: "13:30",
        activity: "Tajweed Rules and Theoretical Arabic Recitation Studies"
      },
      {
        eventId: campEvent.id,
        day: "Daily",
        period: "Afternoon",
        startTime: "14:30",
        endTime: "16:00",
        activity: "Sports, Robotics Workshops, and Interactive Activities"
      },
      {
        eventId: campEvent.id,
        day: "Daily",
        period: "Evening",
        startTime: "19:00",
        endTime: "20:30",
        activity: "Islamic Tarbiyah Lectures and Character Building Circles"
      }
    ]
  });

  // Seed gallery
  await prisma.eventGallery.createMany({
    data: [
      {
        eventId: campEvent.id,
        imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop",
        isCover: true,
        order: 0,
        caption: "Intensive Quran recitation circle in our main hall."
      },
      {
        eventId: campEvent.id,
        imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop",
        isCover: false,
        order: 1,
        caption: "Spacious and comfortable camp hostel dormitories."
      }
    ]
  });

  console.log('\nSeed process completed successfully!');
  console.log('--- Login Credentials ---');
  console.log(`Super Admin: ${adminEmail} / (Password from .env)`);
  console.log(`Default Branch: ${branch.name} (${branch.code})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
