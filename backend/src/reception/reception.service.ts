import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import {
  CreateEnquiryDto,
  CreateCallLogDto,
  CreateVisitorLogDto,
  CreateComplaintDto,
  CreatePostalRecordDto,
  UpdateEnquiryDto,
  UpdateCallLogDto,
  UpdateVisitorLogDto,
  UpdateComplaintDto,
  UpdatePostalRecordDto,
} from './dto/reception.dto';

@Injectable()
export class ReceptionService {
  constructor(private prisma: PrismaService) {}

  // Enquiries
  createEnquiry(dto: CreateEnquiryDto) {
    const { date, status, nextFollowUpDate, ...rest } = dto as any;
    return this.prisma.admissionEnquiry.create({
      data: {
        ...rest,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
        date: date ? new Date(date) : new Date(),
        status: status || 'PENDING',
      },
    });
  }

  getEnquiries(branchId: string) {
    return this.prisma.admissionEnquiry.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Call Logs
  createCallLog(dto: CreateCallLogDto) {
    const { date, nextFollowUpDate, ...rest } = dto as any;
    return this.prisma.callLog.create({
      data: {
        ...rest,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
        date: date ? new Date(date) : new Date(),
      },
    });
  }

  getCallLogs(branchId: string) {
    return this.prisma.callLog.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Visitor Logs
  createVisitorLog(dto: CreateVisitorLogDto) {
    const { date, ...rest } = dto as any;
    return this.prisma.visitorLog.create({
      data: {
        ...rest,
        date: date ? new Date(date) : new Date(),
        inTime: (dto as any).inTime || new Date().toTimeString().slice(0, 5),
      },
    });
  }

  getVisitorLogs(branchId: string) {
    return this.prisma.visitorLog.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Complaints
  createComplaint(dto: CreateComplaintDto) {
    const { date, status, ...rest } = dto as any;
    return this.prisma.complaint.create({
      data: {
        ...rest,
        date: date ? new Date(date) : new Date(),
        status: status || 'PENDING',
      },
    });
  }

  getComplaints(branchId: string) {
    return this.prisma.complaint.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Postal Records
  createPostalRecord(dto: CreatePostalRecordDto) {
    const { date, ...rest } = dto as any;
    return this.prisma.postalRecord.create({
      data: {
        ...rest,
        date: date ? new Date(date) : new Date(),
      },
    });
  }

  getPostalRecords(branchId: string) {
    return this.prisma.postalRecord.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Updates
  async updateEnquiry(id: string, dto: UpdateEnquiryDto, context: TenantContext) {
    const existing = await this.prisma.admissionEnquiry.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Enquiry not found');
    const { date, nextFollowUpDate, ...rest } = dto as any;
    return this.prisma.admissionEnquiry.update({
      where: { id, branchId: context.branchId || undefined },
      data: {
        ...rest,
        ...(date !== undefined ? { date: new Date(date) } : {}),
        ...(nextFollowUpDate !== undefined ? { nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null } : {}),
      },
    });
  }

  async deleteEnquiry(id: string, context: TenantContext) {
    const existing = await this.prisma.admissionEnquiry.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Enquiry not found');
    return this.prisma.admissionEnquiry.delete({ where: { id, branchId: context.branchId || undefined } });
  }

  async updateCallLog(id: string, dto: UpdateCallLogDto, context: TenantContext) {
    const existing = await this.prisma.callLog.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Call log not found');
    const { date, nextFollowUpDate, ...rest } = dto as any;
    return this.prisma.callLog.update({
      where: { id, branchId: context.branchId || undefined },
      data: {
        ...rest,
        ...(date !== undefined ? { date: new Date(date) } : {}),
        ...(nextFollowUpDate !== undefined ? { nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null } : {}),
      },
    });
  }

  async deleteCallLog(id: string, context: TenantContext) {
    const existing = await this.prisma.callLog.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Call log not found');
    return this.prisma.callLog.delete({ where: { id, branchId: context.branchId || undefined } });
  }

  async updateVisitorLog(id: string, dto: UpdateVisitorLogDto, context: TenantContext) {
    const existing = await this.prisma.visitorLog.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Visitor log not found');
    const { date, ...rest } = dto as any;
    return this.prisma.visitorLog.update({
      where: { id, branchId: context.branchId || undefined },
      data: {
        ...rest,
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    });
  }

  async deleteVisitorLog(id: string, context: TenantContext) {
    const existing = await this.prisma.visitorLog.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Visitor log not found');
    return this.prisma.visitorLog.delete({ where: { id, branchId: context.branchId || undefined } });
  }

  async updateComplaint(id: string, dto: UpdateComplaintDto, context: TenantContext) {
    const existing = await this.prisma.complaint.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Complaint not found');
    const { date, ...rest } = dto as any;
    return this.prisma.complaint.update({
      where: { id, branchId: context.branchId || undefined },
      data: {
        ...rest,
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    });
  }

  async deleteComplaint(id: string, context: TenantContext) {
    const existing = await this.prisma.complaint.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Complaint not found');
    return this.prisma.complaint.delete({ where: { id, branchId: context.branchId || undefined } });
  }

  async updatePostalRecord(id: string, dto: UpdatePostalRecordDto, context: TenantContext) {
    const existing = await this.prisma.postalRecord.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Postal record not found');
    const { date, ...rest } = dto as any;
    return this.prisma.postalRecord.update({
      where: { id, branchId: context.branchId || undefined },
      data: {
        ...rest,
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    });
  }

  async deletePostalRecord(id: string, context: TenantContext) {
    const existing = await this.prisma.postalRecord.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!existing) throw new NotFoundException('Postal record not found');
    return this.prisma.postalRecord.delete({ where: { id, branchId: context.branchId || undefined } });
  }

}
