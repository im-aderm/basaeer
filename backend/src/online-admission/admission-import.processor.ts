import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UploadService } from '../upload/upload.service';
import AdmZip from 'adm-zip';
import * as crypto from 'crypto';
import sharp from 'sharp';

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  _passport: 'passportPhoto',
  _birthcert: 'birthCertificateUrl',
  _nin: 'ninUrl',
  _schoolreport: 'schoolReportUrl',
  _medical: 'medicalReportUrl',
  _recommendation: 'recommendationLetterUrl',
  _transferletter: 'transferLetterUrl',
  _transfercert: 'transferCertificateUrl',
  _payment: 'paymentReceiptUrl',
};

const PASSPORT_MAX_SIZE = 200 * 1024; // 200KB
const PASSPORT_WIDTH = 300;
const PASSPORT_HEIGHT = 300;
const WHITE_THRESHOLD = 240;
const WHITE_PIXEL_RATIO = 0.8;

interface ImportContext {
  userId: string;
  branchId: string;
  role: string;
  isSuperAdmin?: boolean;
}

@Processor('admission-import')
export class AdmissionImportProcessor extends WorkerHost {
  private readonly logger = new Logger(AdmissionImportProcessor.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private uploadService: UploadService,
  ) {
    super();
  }

  async process(job: Job<{ fileBuffer: Buffer; context: ImportContext }>) {
    const { fileBuffer, context } = job.data;

    await job.updateProgress(0);

    // Extract ZIP
    const zip = new AdmZip(fileBuffer);
    const entries = zip.getEntries();

    // Find CSV file
    const csvEntry = entries.find(
      (e) => e.entryName.toLowerCase().endsWith('.csv') && !e.entryName.includes('/'),
    );
    if (!csvEntry) {
      throw new Error('No CSV file found in ZIP root');
    }

    const csvContent = csvEntry.getData().toString('utf-8');
    const lines = this.parseCsvLines(csvContent);
    if (lines.length < 2) {
      throw new Error('CSV file must contain a header row and at least one data row');
    }

    const headers = this.parseCsvLine(lines[0]);

    // Build document map from documents/ folder
    const documentMap = new Map<string, Map<string, Buffer>>();
    for (const entry of entries) {
      if (entry.isDirectory) continue;
      if (entry.entryName.toLowerCase().endsWith('.csv')) continue;
      if (!entry.entryName.startsWith('documents/')) continue;

      const fileName = entry.entryName.replace('documents/', '');
      const parts = fileName.split('_');
      if (parts.length < 2) continue;

      // Email is everything before the last underscore+type
      const lastUnderscore = fileName.lastIndexOf('_');
      if (lastUnderscore === -1) continue;

      const email = fileName.substring(0, lastUnderscore).toLowerCase();
      const typeWithExt = fileName.substring(lastUnderscore);
      const typeKey = typeWithExt.split('.')[0];

      const mappedField = DOCUMENT_TYPE_MAP[typeKey];
      if (!mappedField) continue;

      if (!documentMap.has(email)) {
        documentMap.set(email, new Map());
      }
      documentMap.get(email)!.set(mappedField, entry.getData());
    }

    // Load reference data
    const classes = await this.prisma.class.findMany({
      where: { branchId: context.branchId },
    });
    const sections = await this.prisma.section.findMany({
      where: { class: { branchId: context.branchId } },
    });
    const sessions = await this.prisma.academicSession.findMany({
      where: { branchId: context.branchId },
    });

    let success = 0;
    let failed = 0;
    const details: string[] = [];
    const parsingErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      await job.updateProgress(Math.round(((i) / (lines.length - 1)) * 100));

      const rowNumber = i + 1;
      let row: Record<string, string>;
      try {
        const values = this.parseCsvLine(line);
        if (values.length !== headers.length) {
          parsingErrors.push(`Row ${rowNumber}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
          failed++;
          continue;
        }
        row = {};
        headers.forEach((h, idx) => {
          row[h.trim()] = values[idx]?.trim() || '';
        });
      } catch (err: any) {
        parsingErrors.push(`Row ${rowNumber}: Failed to parse CSV line - ${err.message}`);
        failed++;
        continue;
      }

      try {
        // Validate required fields
        const requiredFields = [
          'FirstName', 'LastName', 'Gender', 'DateOfBirth',
          'GuardianName', 'GuardianPhone',
          'AdmissionType', 'AcademicSession', 'DesiredClass', 'BranchId',
          'GuardianConsent', 'SchoolRulesAgreement',
        ];
        for (const field of requiredFields) {
          if (!row[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Validate enums
        if (!['MALE', 'FEMALE'].includes(row['Gender'])) {
          throw new Error(`Invalid Gender: ${row['Gender']}. Must be MALE or FEMALE`);
        }
        if (!['NEW', 'TRANSFER'].includes(row['AdmissionType'])) {
          throw new Error(`Invalid AdmissionType: ${row['AdmissionType']}. Must be NEW or TRANSFER`);
        }

        // Resolve references
        const session = sessions.find(
          (s) => s.name.toLowerCase() === row['AcademicSession'].toLowerCase() || s.id === row['AcademicSession'],
        );
        if (!session) {
          throw new Error(`AcademicSession not found: ${row['AcademicSession']}`);
        }

        const cls = classes.find(
          (c) => c.name.toLowerCase() === row['DesiredClass'].toLowerCase() || c.id === row['DesiredClass'],
        );
        if (!cls) {
          throw new Error(`DesiredClass not found: ${row['DesiredClass']}`);
        }

        let sectionId: string | undefined;
        if (row['DesiredSection']) {
          const sec = sections.find(
            (s) =>
              s.classId === cls.id &&
              (s.name.toLowerCase() === row['DesiredSection'].toLowerCase() || s.id === row['DesiredSection']),
          );
          if (sec) sectionId = sec.id;
        }

        // Resolve branch - restrict to context branch unless super admin
        let resolvedBranchId = context.branchId;
        if (row['BranchId'] && context.isSuperAdmin) {
          const branch = await this.prisma.branch.findFirst({
            where: {
              OR: [{ id: row['BranchId'] }, { name: row['BranchId'] }],
            },
          });
          if (branch) {
            resolvedBranchId = branch.id;
          } else {
            throw new Error(`Branch not found: ${row['BranchId']}`);
          }
        }

        // Process documents
        const studentEmail = row['StudentEmail'] || `${row['FirstName']}.${row['LastName']}@import.local`.toLowerCase();
        const docs = documentMap.get(studentEmail) || new Map();
        const documentUrls: Record<string, string> = {};

        for (const [field, buffer] of docs) {
          const ext = this.getFileExtension(buffer, field);
          const filename = `${studentEmail}_${field}.${ext}`;
          const mimeType = this.getMimeType(buffer, ext);

          try {
            // Special validation for passport photo
            if (field === 'passportPhoto') {
              await this.validatePassportPhoto(buffer);
            }

            const uploadResult = await this.uploadService.uploadFile(buffer, filename, mimeType, 'admission-document');
            documentUrls[field] = uploadResult.url;
          } catch (err: any) {
            if (field === 'passportPhoto') {
              throw new Error(`Passport photo validation failed: ${err.message}`);
            }
            this.logger.warn(`Failed to upload document ${field} for ${studentEmail}: ${err.message}`);
          }
        }

        // Parse booleans
        const parseBool = (val: string) => ['TRUE', '1', 'YES', 'Y'].includes(val.toUpperCase());

        // Create admission
        const admissionData: any = {
          firstName: row['FirstName'],
          lastName: row['LastName'],
          gender: row['Gender'],
          dateOfBirth: new Date(row['DateOfBirth']),
          nationality: row['Nationality'] || undefined,
          stateOfOrigin: row['StateOfOrigin'] || undefined,
          lga: row['LGA'] || undefined,
          religion: row['Religion'] || undefined,
          bloodGroup: row['BloodGroup'] || undefined,
          genotype: row['Genotype'] || undefined,
          address: row['Address'] || undefined,
          city: row['City'] || undefined,
          state: row['State'] || undefined,
          country: row['Country'] || undefined,
          phone: row['Phone'] || undefined,
          studentEmail: row['StudentEmail'] || undefined,
          guardianName: row['GuardianName'],
          guardianRelation: row['GuardianRelation'] || undefined,
          guardianPhone: row['GuardianPhone'],
          guardianEmail: row['GuardianEmail'] || undefined,
          guardianAddress: row['GuardianAddress'] || undefined,
          guardianOccupation: row['GuardianOccupation'] || undefined,
          secondaryGuardianName: row['SecondaryGuardianName'] || undefined,
          secondaryGuardianPhone: row['SecondaryGuardianPhone'] || undefined,
          secondaryGuardianRelation: row['SecondaryGuardianRelation'] || undefined,
          fatherName: row['FatherName'] || undefined,
          fatherOccupation: row['FatherOccupation'] || undefined,
          fatherPhone: row['FatherPhone'] || undefined,
          motherName: row['MotherName'] || undefined,
          motherOccupation: row['MotherOccupation'] || undefined,
          motherPhone: row['MotherPhone'] || undefined,
          transferReason: row['TransferReason'] || undefined,
          hasMedicalCondition: parseBool(row['HasMedicalCondition'] || 'FALSE'),
          medicalConditionInfo: row['MedicalConditionInfo'] || undefined,
          hasLearningDifficulty: parseBool(row['HasLearningDifficulty'] || 'FALSE'),
          learningDifficultyInfo: row['LearningDifficultyInfo'] || undefined,
          hasSpecialNeeds: parseBool(row['HasSpecialNeeds'] || 'FALSE'),
          specialNeedsInfo: row['SpecialNeedsInfo'] || undefined,
          hasSiblingsInSchool: parseBool(row['HasSiblingsInSchool'] || 'FALSE'),
          howHeard: row['HowHeard'] || undefined,
          seekingFinancialAid: parseBool(row['SeekingFinancialAid'] || 'FALSE'),
          admissionType: row['AdmissionType'],
          academicSessionId: session.id,
          desiredClassId: cls.id,
          desiredSectionId: sectionId,
          branchId: resolvedBranchId,
          guardianConsent: parseBool(row['GuardianConsent']),
          schoolRulesAgreement: parseBool(row['SchoolRulesAgreement']),
          ...documentUrls,
        };

        // Handle previous school
        if (row['PreviousSchool']) {
          admissionData.previousSchools = {
            create: [
              {
                institutionName: row['PreviousSchool'],
                address: row['PreviousSchoolAddress'] || undefined,
                fromYear: undefined,
                toYear: undefined,
              },
            ],
          };
        }

        // Generate admission number
        const year = new Date().getFullYear();
        const counter = await this.prisma.counter.upsert({
          where: { branchId_model: { branchId: resolvedBranchId, model: 'Student' } },
          update: { lastValue: { increment: 1 } },
          create: { branchId: resolvedBranchId, model: 'Student', lastValue: 1 },
        });

        admissionData.admissionNumber = `BMS-${year}-${counter.lastValue.toString().padStart(4, '0')}`;

        await this.prisma.onlineAdmission.create({
          data: admissionData,
        });

        success++;
        details.push(`Row ${rowNumber}: ${row['FirstName']} ${row['LastName']} imported successfully`);
      } catch (error: any) {
        failed++;
        details.push(`Row ${rowNumber}: FAILED - ${error.message}`);
      }
    }

    return { success, failed, details, parsingErrors };
  }

  private parseCsvLines(content: string): string[] {
    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (current.trim()) {
          lines.push(current);
        }
        current = '';
        if (char === '\r' && content[i + 1] === '\n') i++;
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      lines.push(current);
    }
    return lines;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  }

  private async validatePassportPhoto(buffer: Buffer): Promise<void> {
    // Check file size
    if (buffer.length > PASSPORT_MAX_SIZE) {
      throw new Error(
        `Passport photo exceeds 200KB limit (${(buffer.length / 1024).toFixed(1)}KB)`,
      );
    }

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to read passport photo dimensions');
    }

    // Check dimensions
    if (metadata.width !== PASSPORT_WIDTH || metadata.height !== PASSPORT_HEIGHT) {
      throw new Error(
        `Passport photo must be exactly ${PASSPORT_WIDTH}x${PASSPORT_HEIGHT}px (current: ${metadata.width}x${metadata.height}px)`,
      );
    }

    // Check white background
    const { data, info } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const totalPixels = info.width * info.height;
    const channels = info.channels;
    let whitePixels = 0;

    // Sample border region (outer 15% of image)
    const borderX = Math.floor(info.width * 0.15);
    const borderY = Math.floor(info.height * 0.15);

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        // Check if pixel is in border region
        if (
          x < borderX ||
          x >= info.width - borderX ||
          y < borderY ||
          y >= info.height - borderY
        ) {
          const idx = (y * info.width + x) * channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          if (r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD) {
            whitePixels++;
          }
        }
      }
    }

    const totalBorderPixels =
      totalPixels - (info.width - 2 * borderX) * (info.height - 2 * borderY);
    const whiteRatio = whitePixels / totalBorderPixels;

    if (whiteRatio < WHITE_PIXEL_RATIO) {
      throw new Error(
        `Passport photo background is not sufficiently white (${Math.round(whiteRatio * 100)}% white pixels, requires ${Math.round(WHITE_PIXEL_RATIO * 100)}%)`,
      );
    }
  }

  private getFileExtension(buffer: Buffer, field: string): string {
    // Try to detect from magic bytes
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'png';
    if (buffer[0] === 0x25 && buffer[1] === 0x50) return 'pdf';
    if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'webp';
    // Default based on field
    if (field === 'passportPhoto') return 'jpg';
    return 'pdf';
  }

  private getMimeType(buffer: Buffer, ext: string): string {
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      pdf: 'application/pdf',
    };
    return mimeMap[ext] || 'application/octet-stream';
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `Admission import job ${job.id} completed: ${job.returnvalue?.success} successes, ${job.returnvalue?.failed} failures`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Admission import job ${job.id} failed: ${error.message}`);
  }
}
