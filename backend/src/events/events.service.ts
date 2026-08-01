import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { ProvidersService } from '../providers/providers.service';
import { Decimal } from '@prisma/client/runtime/library';
import { computeDiscount, discountCapsFromEnv } from '../finance/discount.util';
import {
  CreateCampusEventDto,
  UpdateCampusEventDto,
  CreateEventApplicationDto,
  UpdateApplicationStatusDto,
  VerifyPaymentDto,
  UpdateEventRSVPDto,
} from './dto/events.dto';
import * as crypto from 'crypto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private mailService: MailService,
    private providersService: ProvidersService,
  ) {}

  private async generateSlug(title: string, excludeId?: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    if (!baseSlug) {
      return crypto.randomUUID().slice(0, 8);
    }

    let slug = baseSlug;
    let count = 0;

    while (true) {
      // `slug` is globally @unique, so uniqueness must be checked globally
      // (not per-branch). When updating, exclude the event itself so its own
      // slug isn't treated as a collision.
      const existing = await this.prisma.campusEvent.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
        select: { id: true },
      });
      if (!existing) break;
      count++;
      slug = `${baseSlug}-${count}`;
    }

    return slug;
  }

  async createEvent(branchId: string, dto: CreateCampusEventDto, context: TenantContext) {
    if (!branchId) {
      throw new BadRequestException('Branch ID is required');
    }

    const slug = await this.generateSlug(dto.title);

    const event = await this.prisma.$transaction(async (tx) => {
      const createdEvent = await tx.campusEvent.create({
        data: {
          title: dto.title,
          slug,
          shortDescription: dto.shortDescription,
          fullDescription: dto.fullDescription,
          objectives: dto.objectives || [],
          rulesAndDiscipline: dto.rulesAndDiscipline,
          requirements: dto.requirements || [],
          mealsAndHospitality: dto.mealsAndHospitality,
          whyChooseThisEvent: dto.whyChooseThisEvent || [],
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
          location: dto.location,
          categoryId: null,
          categoryLabel: dto.category || 'OTHERS',
          isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
          allowRSVP: dto.allowRSVP !== undefined ? dto.allowRSVP : true,
          status: dto.status || 'DRAFT',
          active: dto.active !== undefined ? dto.active : true,
          featuredImage: dto.featuredImage,
          brochurePdf: dto.brochurePdf,
          capacity: dto.capacity,
          registrationOpen: dto.registrationOpen !== undefined ? dto.registrationOpen : true,
          applicationFormEnabled: dto.applicationFormEnabled !== undefined ? dto.applicationFormEnabled : true,
          paymentRequired: dto.paymentRequired !== undefined ? dto.paymentRequired : false,
          seoMetadata: dto.seoMetadata || {},
          branchId,
        },
      });

      if (dto.packages && dto.packages.length > 0) {
        await tx.eventPackage.createMany({
          data: dto.packages.map((pkg) => ({
            eventId: createdEvent.id,
            title: pkg.title,
            ageRange: pkg.ageRange,
            timing: pkg.timing,
            fee: pkg.fee,
            boardingType: pkg.boardingType,
            availableSlots: pkg.availableSlots,
            description: pkg.description,
          })),
        });
      }

      if (dto.schedules && dto.schedules.length > 0) {
        await tx.eventSchedule.createMany({
          data: dto.schedules.map((sch) => ({
            eventId: createdEvent.id,
            day: sch.day,
            period: sch.period,
            startTime: sch.startTime,
            endTime: sch.endTime,
            activity: sch.activity,
          })),
        });
      }

      if (dto.gallery && dto.gallery.length > 0) {
        await tx.eventGallery.createMany({
          data: dto.gallery.map((img) => ({
            eventId: createdEvent.id,
            imageUrl: img.imageUrl,
            isCover: img.isCover || false,
            order: img.order || 0,
            caption: img.caption,
          })),
        });
      }

      return createdEvent;
    });

    await this.audit.log({
      action: 'CREATE',
      module: 'Events',
      context,
      targetId: event.id,
      targetType: 'CampusEvent',
      details: { title: event.title, slug: event.slug },
    });

    return event;
  }

  async getEvents(context: TenantContext, isPublic?: boolean) {
    const where: any = {};
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
      where.active = true;
    }

    const isolatedWhere = TenantHelper.applyIsolation(where, context);

    return this.prisma.campusEvent.findMany({
      where: isolatedWhere,
      include: {
        packages: true,
        gallery: true,
        _count: {
          select: { rsvps: true, applications: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getPublicEvents(branchId?: string, category?: string) {
    const where: any = {
      isPublic: true,
      active: true,
    };
    if (branchId) where.branchId = branchId;
    if (category) where.category = category;

    return this.prisma.campusEvent.findMany({
      where,
      include: {
        packages: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getPublicEventBySlug(slug: string) {
    const event = await this.prisma.campusEvent.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { active: true },
          orderBy: { fee: 'asc' },
        },
        schedules: {
          orderBy: [
            { day: 'asc' },
            { startTime: 'asc' },
          ],
        },
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!event || !event.active || !event.isPublic) {
      throw new NotFoundException('Event not found or is inactive');
    }

    return event;
  }

  async getEventDetails(id: string, context: TenantContext) {
    const event = await this.prisma.campusEvent.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        packages: true,
        schedules: {
          orderBy: [
            { day: 'asc' },
            { startTime: 'asc' },
          ],
        },
        gallery: {
          orderBy: { order: 'asc' },
        },
        rsvps: {
          include: {
            user: {
              select: { firstName: true, lastName: true, role: true },
            },
          },
        },
        _count: {
          select: { rsvps: true, applications: true },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async updateEvent(id: string, dto: UpdateCampusEventDto, context: TenantContext) {
    const isolatedWhere = TenantHelper.applyIsolation({ id }, context);
    const existing = await this.prisma.campusEvent.findFirst({
      where: isolatedWhere,
    });
    if (!existing) throw new NotFoundException('Event not found');

    // Only regenerate the slug when the title actually changes; otherwise keep
    // the existing slug (avoids needless slug drift and self-collision).
    const slug =
      dto.title && dto.title !== existing.title
        ? await this.generateSlug(dto.title, existing.id)
        : existing.slug;

    const updated = await this.prisma.$transaction(async (tx) => {
      const event = await tx.campusEvent.update({
        where: { id, branchId: context.branchId ?? undefined },
        data: {
          title: dto.title,
          slug,
          shortDescription: dto.shortDescription,
          fullDescription: dto.fullDescription,
          objectives: dto.objectives || [],
          rulesAndDiscipline: dto.rulesAndDiscipline,
          requirements: dto.requirements || [],
          mealsAndHospitality: dto.mealsAndHospitality,
          whyChooseThisEvent: dto.whyChooseThisEvent || [],
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          endDate: dto.endDate ? new Date(dto.endDate) : undefined,
          applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
          location: dto.location,
          categoryLabel: dto.category || existing.categoryLabel,
          isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
          allowRSVP: dto.allowRSVP !== undefined ? dto.allowRSVP : true,
          status: dto.status || 'DRAFT',
          active: dto.active !== undefined ? dto.active : true,
          featuredImage: dto.featuredImage,
          brochurePdf: dto.brochurePdf,
          capacity: dto.capacity,
          registrationOpen: dto.registrationOpen !== undefined ? dto.registrationOpen : true,
          applicationFormEnabled: dto.applicationFormEnabled !== undefined ? dto.applicationFormEnabled : true,
          paymentRequired: dto.paymentRequired !== undefined ? dto.paymentRequired : false,
          seoMetadata: dto.seoMetadata || {},
        },
      });

      // Packages: soft-delete old, create new (preserves historical application data)
      await tx.eventPackage.updateMany({
        where: { eventId: id, active: true },
        data: { active: false },
      });
      if (dto.packages && dto.packages.length > 0) {
        await tx.eventPackage.createMany({
          data: dto.packages.map((pkg) => ({
            eventId: id,
            title: pkg.title,
            ageRange: pkg.ageRange,
            timing: pkg.timing,
            fee: pkg.fee,
            boardingType: pkg.boardingType,
            availableSlots: pkg.availableSlots,
            description: pkg.description,
          })),
        });
      }

      await tx.eventSchedule.deleteMany({ where: { eventId: id } });
      if (dto.schedules && dto.schedules.length > 0) {
        await tx.eventSchedule.createMany({
          data: dto.schedules.map((sch) => ({
            eventId: id,
            day: sch.day,
            period: sch.period,
            startTime: sch.startTime,
            endTime: sch.endTime,
            activity: sch.activity,
          })),
        });
      }

      await tx.eventGallery.deleteMany({ where: { eventId: id } });
      if (dto.gallery && dto.gallery.length > 0) {
        await tx.eventGallery.createMany({
          data: dto.gallery.map((img) => ({
            eventId: id,
            imageUrl: img.imageUrl,
            isCover: img.isCover || false,
            order: img.order || 0,
            caption: img.caption,
          })),
        });
      }

      return event;
    });

    await this.audit.log({
      action: 'UPDATE',
      module: 'Events',
      context,
      targetId: id,
      targetType: 'CampusEvent',
      beforeState: existing,
      afterState: updated,
    });

    return updated;
  }

  async deleteEvent(id: string, context: TenantContext) {
    const existing = await this.prisma.campusEvent.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Event not found');

    await this.prisma.campusEvent.delete({
      where: { id, branchId: context.branchId ?? undefined },
    });

    await this.audit.log({
      action: 'DELETE',
      module: 'Events',
      context,
      targetId: id,
      targetType: 'CampusEvent',
      details: { title: existing.title },
    });

    return { success: true };
  }

  async updateRSVP(eventId: string, userId: string, dto: UpdateEventRSVPDto, context: TenantContext) {
    // Verify event exists and belongs to user's branch (tenant isolation)
    const event = await this.prisma.campusEvent.findFirst({
      where: TenantHelper.applyIsolation({ id: eventId }, context),
    });
    if (!event) throw new NotFoundException('Event not found');
    if (!event.allowRSVP) throw new BadRequestException('RSVP is not allowed for this event');

    return this.prisma.eventRSVP.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      update: { status: dto.status },
      create: { eventId, userId, status: dto.status },
    });
  }

  // --- Applications System ---

  async submitApplication(slug: string, dto: CreateEventApplicationDto) {
    const event = await this.prisma.campusEvent.findUnique({
      where: { slug },
      include: { packages: { where: { active: true } } },
    });

    if (!event || !event.active || !event.applicationFormEnabled) {
      throw new BadRequestException('Applications are not open for this event');
    }

    if (event.applicationDeadline && new Date() > new Date(event.applicationDeadline)) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Verify package belongs to event
    const pkg = event.packages.find((p) => p.id === dto.packageId);
    if (!pkg) {
      throw new BadRequestException('Invalid package selected');
    }

    // Enforce per-package slot check first, then overall capacity
    if (pkg.availableSlots) {
      const pkgAppCount = await this.prisma.eventApplication.count({
        where: { eventId: event.id, packageId: pkg.id, status: { not: 'REJECTED' } },
      });
      if (pkgAppCount >= pkg.availableSlots) {
        throw new BadRequestException('Package slot limit reached');
      }
    }

    if (event.capacity) {
      const appCount = await this.prisma.eventApplication.count({
        where: { eventId: event.id, status: { not: 'REJECTED' } },
      });
      if (appCount >= event.capacity) {
        throw new BadRequestException('Registration capacity limit reached');
      }
    }

    // Calculate age based on Date of Birth (precise)
    const dob = new Date(dto.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const application = await this.prisma.eventApplication.create({
      data: {
        eventId: event.id,
        packageId: dto.packageId,
        branchId: event.branchId,
        fullName: dto.fullName,
        gender: dto.gender,
        dateOfBirth: dob,
        age,
        parentName: dto.parentName,
        parentPhone: dto.parentPhone,
        parentEmail: dto.parentEmail,
        address: dto.address,
        state: dto.state,
        localGovernment: dto.localGovernment,
        memorizationLevel: dto.memorizationLevel,
        school: dto.school,
        islamicBackground: dto.islamicBackground,
        previousParticipation: dto.previousParticipation,
        medicalConditions: dto.medicalConditions,
        allergies: dto.allergies,
        emergencyContact: dto.emergencyContact,
        accommodationPreference: dto.accommodationPreference,
        passportPhotoUrl: dto.passportPhotoUrl,
        birthCertificateUrl: dto.birthCertificateUrl,
        ninUrl: dto.ninUrl,
        schoolIdUrl: dto.schoolIdUrl,
        medicalReportUrl: dto.medicalReportUrl,
        proofOfPaymentUrl: dto.proofOfPaymentUrl,
      },
    });

    return application;
  }

  async getApplications(eventId: string, context: TenantContext) {
    // Atomic: query applications with branchId in a single operation
    return this.prisma.eventApplication.findMany({
      where: {
        eventId,
        event: TenantHelper.applyIsolation({}, context),
      },
      include: {
        event: true,
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllApplications(context: TenantContext) {
    const where = TenantHelper.applyIsolation({}, context);

    return this.prisma.eventApplication.findMany({
      where,
      include: {
        event: {
          select: { title: true, slug: true },
        },
        package: {
          select: { title: true, fee: true },
        },
        branch: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApplicationDetails(id: string, context: TenantContext) {
    const app = await this.prisma.eventApplication.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        event: true,
        package: true,
        branch: true,
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto, context: TenantContext) {
    const app = await this.prisma.eventApplication.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        event: { select: { title: true, slug: true, branchId: true } },
      },
    });
    if (!app) throw new NotFoundException('Application not found');

    const updated = await this.prisma.eventApplication.update({
      where: { id, branchId: context.branchId ?? undefined },
      data: { status: dto.status },
    });

    await this.audit.log({
      action: 'UPDATE_STATUS',
      module: 'Events',
      context,
      targetId: id,
      targetType: 'EventApplication',
      details: { to: dto.status },
    });

    // Send notifications on approval / rejection
    if (dto.status === 'APPROVED') {
      this.sendApprovalNotifications(app).catch(err =>
        this.logger.error(`Approval notifications failed: ${err.message}`, err.stack),
      );
    } else if (dto.status === 'REJECTED') {
      this.sendRejectionNotifications(app, 'Your application did not meet the requirements.').catch(err =>
        this.logger.error(`Rejection notifications failed: ${err.message}`, err.stack),
      );
    }

    return updated;
  }

  async verifyPayment(id: string, dto: VerifyPaymentDto, context: TenantContext) {
    const app: any = await this.prisma.eventApplication.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
      include: {
        event: { select: { title: true, slug: true, branchId: true } },
        package: { select: { fee: true } },
      },
    });
    if (!app) throw new NotFoundException('Application not found');

    // Optionally apply a discount to the registration fee at approval time.
    // Restricted, capped, reason-required, audited, and applied at most once.
    const discountData: any = {};
    if (dto.discountType && dto.discountValue != null) {
      if (app.discountAmount != null) {
        throw new BadRequestException(
          'A discount has already been applied to this registration.',
        );
      }
      if (!dto.discountReason || !dto.discountReason.trim()) {
        throw new BadRequestException('A reason is required when applying a discount.');
      }
      const fee = new Decimal(app.package?.fee ?? 0);
      const { discountAmount } = computeDiscount(
        fee,
        { type: dto.discountType, value: dto.discountValue },
        discountCapsFromEnv(),
      );
      discountData.discountType = dto.discountType;
      discountData.discountValue = new Decimal(dto.discountValue);
      discountData.discountAmount = discountAmount;
      discountData.discountReason = dto.discountReason.trim();
      discountData.discountedById = context.userId;
      discountData.discountedAt = new Date();
    }

    const updated = await this.prisma.eventApplication.update({
      where: { id, branchId: context.branchId ?? undefined },
      data: { paymentStatus: dto.paymentStatus, ...discountData },
    });

    await this.audit.log({
      action: 'VERIFY_PAYMENT',
      module: 'Events',
      context,
      targetId: id,
      targetType: 'EventApplication',
      details: {
        to: dto.paymentStatus,
        ...(discountData.discountAmount
          ? {
              discountType: discountData.discountType,
              discountAmount: discountData.discountAmount.toString(),
              discountReason: discountData.discountReason,
            }
          : {}),
      },
    });

    // Send notification on payment verification
    if (dto.paymentStatus === 'VERIFIED') {
      this.sendPaymentVerifiedNotifications(app).catch(err =>
        this.logger.error(`Payment verification notifications failed: ${err.message}`, err.stack),
      );
    }

    return updated;
  }

  async deleteApplication(id: string, context: TenantContext) {
    const app = await this.prisma.eventApplication.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!app) throw new NotFoundException('Application not found');

    await this.prisma.eventApplication.delete({ where: { id } });

    await this.audit.log({
      action: 'DELETE_APPLICATION',
      module: 'Events',
      context,
      targetId: id,
      targetType: 'EventApplication',
    });

    return { success: true };
  }

  // ─── Notification Helpers ───────────────────────────────────────────────────

  private async sendApprovalNotifications(app: any) {
    const { parentEmail, parentPhone, fullName, event } = app;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const emailPromise = parentEmail
      ? this.mailService.sendEventApplicationApproved(parentEmail, fullName, event.title, event.branchId)
      : Promise.resolve();

    const whatsappMessage =
      `Assalamu Alaikum! ✅ The application for *${fullName}* to *${event.title}* has been APPROVED. ` +
      `Please check your email for the camp requirements and prohibited items documents. ` +
      `Visit the event page for more details: ${baseUrl}/events/${event.slug}`;

    const whatsappPromise = parentPhone
      ? this.providersService.sendWhatsAppWithFailover(parentPhone, whatsappMessage)
      : Promise.resolve();

    await Promise.allSettled([emailPromise, whatsappPromise]);
  }

  private async sendRejectionNotifications(app: any, reason: string) {
    const { parentEmail, parentPhone, fullName, event } = app;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const emailPromise = parentEmail
      ? this.mailService.sendEventApplicationRejected(parentEmail, fullName, event.title, reason, event.branchId)
      : Promise.resolve();

    const whatsappMessage =
      `Assalamu Alaikum. Unfortunately, the application for *${fullName}* to *${event.title}* has been REJECTED. ` +
      `Reason: ${reason}. ` +
      `You are welcome to apply for future events. Visit: ${baseUrl}/events`;

    const whatsappPromise = parentPhone
      ? this.providersService.sendWhatsAppWithFailover(parentPhone, whatsappMessage)
      : Promise.resolve();

    await Promise.allSettled([emailPromise, whatsappPromise]);
  }

  private async sendPaymentVerifiedNotifications(app: any) {
    const { parentEmail, parentPhone, fullName, event } = app;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const emailPromise = parentEmail
      ? this.mailService.sendEventPaymentVerified(parentEmail, fullName, event.title, event.branchId)
      : Promise.resolve();

    const whatsappMessage =
      `Assalamu Alaikum! ✅ Payment for *${fullName}* to *${event.title}* has been VERIFIED. ` +
      `Your spot is confirmed! Please check your email for the camp requirements and prohibited items documents. ` +
      `Event details: ${baseUrl}/events/${event.slug}`;

    const whatsappPromise = parentPhone
      ? this.providersService.sendWhatsAppWithFailover(parentPhone, whatsappMessage)
      : Promise.resolve();

    await Promise.allSettled([emailPromise, whatsappPromise]);
  }

  // --- Analytics (DB-level aggregation, no OOM risk) ---

  async getAnalytics(context: TenantContext) {
    const where = TenantHelper.applyIsolation({}, context);

    const totalEvents = await this.prisma.campusEvent.count({ where });
    const activeEvents = await this.prisma.campusEvent.count({
      where: { ...where, active: true, status: 'ACTIVE' },
    });
    const totalApplicants = await this.prisma.eventApplication.count({ where });
    const pendingApprovals = await this.prisma.eventApplication.count({
      where: { ...where, status: 'PENDING' },
    });

    // Revenue: aggregate package fees for verified applications
    const verifiedApps = await this.prisma.eventApplication.findMany({
      where: { ...where, paymentStatus: 'VERIFIED' },
      select: { packageId: true, discountAmount: true },
    });

    let revenueGenerated = 0;
    if (verifiedApps.length > 0) {
      const packageIds = [...new Set(verifiedApps.map(a => a.packageId))];
      const packages = await this.prisma.eventPackage.findMany({
        where: { id: { in: packageIds } },
        select: { id: true, fee: true },
      });
      const feeMap = new Map(packages.map(p => [p.id, Number(p.fee)]));
      revenueGenerated = verifiedApps.reduce((sum, app) => {
        const fee = feeMap.get(app.packageId) || 0;
        const discount = Number(app.discountAmount || 0);
        return sum + Math.max(fee - discount, 0);
      }, 0);
    }

    // Occupancy rate
    const activeEventsWithCapacity = await this.prisma.campusEvent.findMany({
      where: { ...where, active: true, status: 'ACTIVE' },
      select: { id: true, capacity: true },
    });

    const totalCapacity = activeEventsWithCapacity.reduce(
      (sum, e) => sum + (e.capacity || 0),
      0,
    );

    const totalOccupants = await this.prisma.eventApplication.count({
      where: {
        ...where,
        status: 'APPROVED',
        eventId: { in: activeEventsWithCapacity.map((e) => e.id) },
      },
    });

    const occupancyRate = totalCapacity > 0 ? (totalOccupants / totalCapacity) * 100 : 0;

    // Package popularity: use groupBy
    const packageGroups = await this.prisma.eventApplication.groupBy({
      by: ['packageId'],
      where,
      _count: { packageId: true },
    });

    const packageIds = packageGroups.map(g => g.packageId);
    const packages = packageIds.length > 0 ? await this.prisma.eventPackage.findMany({
      where: { id: { in: packageIds } },
      select: { id: true, title: true },
    }) : [];
    const packageTitleMap = new Map(packages.map(p => [p.id, p.title]));

    const packagePopularity = packageGroups.map(g => ({
      name: packageTitleMap.get(g.packageId) || 'Unknown Package',
      value: g._count.packageId,
    }));

    // Gender distribution: use groupBy
    const genderGroups = await this.prisma.eventApplication.groupBy({
      by: ['gender'],
      where,
      _count: { gender: true },
    });

    const genderDistribution = genderGroups.map(g => ({
      name: g.gender?.toUpperCase() === 'MALE' ? 'Male' : 'Female',
      value: g._count.gender,
    }));

    // Age distribution: use groupBy with raw SQL for ranges, or compute from grouped ages
    const ageGroups = await this.prisma.eventApplication.groupBy({
      by: ['age'],
      where,
      _count: { age: true },
    });

    const ageRanges: Record<string, number> = { 'Under 10': 0, '10-14': 0, '15-18': 0, '18+': 0 };
    ageGroups.forEach(g => {
      const age = g.age;
      if (age < 10) ageRanges['Under 10'] += g._count.age;
      else if (age <= 14) ageRanges['10-14'] += g._count.age;
      else if (age <= 18) ageRanges['15-18'] += g._count.age;
      else ageRanges['18+'] += g._count.age;
    });

    const ageDistribution = Object.keys(ageRanges).map(key => ({
      name: key,
      value: ageRanges[key],
    }));

    // Applications over time: use Prisma groupBy by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const appsByDate = await this.prisma.eventApplication.findMany({
      where: { ...where, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const applicationsOverTime = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const count = appsByDate.filter(app => {
        const created = new Date(app.createdAt);
        return created.getMonth() === d.getMonth() && created.getFullYear() === year;
      }).length;

      applicationsOverTime.push({
        name: `${monthName} ${year}`,
        applications: count,
      });
    }

    return {
      stats: {
        totalEvents,
        activeEvents,
        totalApplicants,
        revenueGenerated,
        pendingApprovals,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
      },
      packagePopularity,
      genderDistribution,
      ageDistribution,
      applicationsOverTime,
    };
  }
}
