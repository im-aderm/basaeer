import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
    return this.prisma.admissionEnquiry.create({ data: dto });
  }

  getEnquiries(branchId: string) {
    return this.prisma.admissionEnquiry.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Call Logs
  createCallLog(dto: CreateCallLogDto) {
    return this.prisma.callLog.create({ data: dto });
  }

  getCallLogs(branchId: string) {
    return this.prisma.callLog.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Visitor Logs
  createVisitorLog(dto: CreateVisitorLogDto) {
    return this.prisma.visitorLog.create({ data: dto });
  }

  getVisitorLogs(branchId: string) {
    return this.prisma.visitorLog.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Complaints
  createComplaint(dto: CreateComplaintDto) {
    return this.prisma.complaint.create({ data: dto });
  }

  getComplaints(branchId: string) {
    return this.prisma.complaint.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Postal Records
  createPostalRecord(dto: CreatePostalRecordDto) {
    return this.prisma.postalRecord.create({ data: dto });
  }

  getPostalRecords(branchId: string) {
    return this.prisma.postalRecord.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Updates
  updateEnquiry(id: string, dto: UpdateEnquiryDto) {
    return this.prisma.admissionEnquiry.update({ where: { id }, data: dto });
  }

  updateCallLog(id: string, dto: UpdateCallLogDto) {
    return this.prisma.callLog.update({ where: { id }, data: dto });
  }

  updateVisitorLog(id: string, dto: UpdateVisitorLogDto) {
    return this.prisma.visitorLog.update({ where: { id }, data: dto });
  }

  updateComplaint(id: string, dto: UpdateComplaintDto) {
    return this.prisma.complaint.update({ where: { id }, data: dto });
  }

  updatePostalRecord(id: string, dto: UpdatePostalRecordDto) {
    return this.prisma.postalRecord.update({ where: { id }, data: dto });
  }

  // Deletes
  deleteEnquiry(id: string) {
    return this.prisma.admissionEnquiry.delete({ where: { id } });
  }

  deleteCallLog(id: string) {
    return this.prisma.callLog.delete({ where: { id } });
  }

  deleteVisitorLog(id: string) {
    return this.prisma.visitorLog.delete({ where: { id } });
  }

  deleteComplaint(id: string) {
    return this.prisma.complaint.delete({ where: { id } });
  }

  deletePostalRecord(id: string) {
    return this.prisma.postalRecord.delete({ where: { id } });
  }
}
