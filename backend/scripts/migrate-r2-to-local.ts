import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient({ log: ['error', 'warn'] });

const R2_DOMAIN = process.env.R2_PUBLIC_DOMAIN || '';

const urlFields: (keyof import('../src/generated/client').EventApplication)[] = [
  'passportPhotoUrl',
  'birthCertificateUrl',
  'ninUrl',
  'schoolIdUrl',
  'medicalReportUrl',
  'proofOfPaymentUrl',
];

const admissionUrlFields: (keyof import('../src/generated/client').OnlineAdmission)[] = [
  'passportPhoto',
  'passportPhoto2',
  'passportPhoto3',
  'passportPhoto4',
  'birthCertificateUrl',
  'testimonialUrl',
  'transferCertificateUrl',
  'immunizationCardUrl',
  'ninUrl',
  'educationalCertUrl',
  'transferLetterUrl',
  'medicalReportUrl',
  'recommendationLetterUrl',
  'schoolReportUrl',
];

function rewriteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!R2_DOMAIN) {
    // If domain is not configured, try to detect R2 URLs by pattern
    if (url.startsWith('http')) return url; // can't rewrite without domain
    return url;
  }
  if (url.startsWith(R2_DOMAIN)) {
    const key = url.slice(R2_DOMAIN.length).replace(/^\//, '');
    return `/uploads/fallback/${key}`;
  }
  return url;
}

async function migrateEventApplications() {
  console.log('--- Migrating EventApplication URLs ---');
  const apps = await prisma.eventApplication.findMany({ select: { id: true, ...urlFields.reduce((acc, f) => ({ ...acc, [f]: true }), {} as any) } });
  let updated = 0;
  for (const app of apps) {
    const data: any = {};
    for (const field of urlFields) {
      const old = (app as any)[field];
      const rewritten = rewriteUrl(old);
      if (rewritten !== old) {
        data[field] = rewritten;
        console.log(`  ${app.id}.${String(field)}: ${old} -> ${rewritten}`);
      }
    }
    if (Object.keys(data).length > 0) {
      await prisma.eventApplication.update({ where: { id: app.id }, data });
      updated++;
    }
  }
  console.log(`Updated ${updated} EventApplication records.`);
}

async function migrateOnlineAdmissions() {
  console.log('--- Migrating OnlineAdmission URLs ---');
  const admissions = await prisma.onlineAdmission.findMany({ select: { id: true, ...admissionUrlFields.reduce((acc, f) => ({ ...acc, [f]: true }), {} as any) } });
  let updated = 0;
  for (const admission of admissions) {
    const data: any = {};
    for (const field of admissionUrlFields) {
      const old = (admission as any)[field];
      const rewritten = rewriteUrl(old);
      if (rewritten !== old) {
        data[field] = rewritten;
        console.log(`  ${admission.id}.${String(field)}: ${old} -> ${rewritten}`);
      }
    }
    if (Object.keys(data).length > 0) {
      await prisma.onlineAdmission.update({ where: { id: admission.id }, data });
      updated++;
    }
  }
  console.log(`Updated ${updated} OnlineAdmission records.`);
}

async function migrateEventFeaturedImages() {
  console.log('--- Migrating CampusEvent featuredImage URLs ---');
  const events = await prisma.campusEvent.findMany({ select: { id: true, featuredImage: true } });
  let updated = 0;
  for (const event of events) {
    const rewritten = rewriteUrl(event.featuredImage);
    if (rewritten !== event.featuredImage) {
      console.log(`  ${event.id}.featuredImage: ${event.featuredImage} -> ${rewritten}`);
      await prisma.campusEvent.update({ where: { id: event.id }, data: { featuredImage: rewritten } });
      updated++;
    }
  }
  console.log(`Updated ${updated} CampusEvent records.`);
}

async function main() {
  console.log('=== R2 to Local Migration ===');
  console.log(`R2_PUBLIC_DOMAIN: ${R2_DOMAIN || '(not set — will skip http URLs)'}`);
  console.log('');

  await migrateEventApplications();
  await migrateOnlineAdmissions();
  await migrateEventFeaturedImages();

  console.log('');
  console.log('=== Migration Complete ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
