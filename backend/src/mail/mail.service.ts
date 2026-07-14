import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BranchBrandingService } from '../branches/branch-branding.service';

export interface EmailTemplate {
  headerColor: string;
  headerTitle: string;
  headerSubtitle: string;
  greeting: string;
  bodyContent: string;
  extraBlocks?: {
    backgroundColor: string;
    borderColor?: string;
    borderSide?: string;
    padding: string;
    content: string;
  }[];
  footerText?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private isConfigured = false;

  constructor(
    private readonly brandingService: BranchBrandingService,
    @InjectQueue('transactional-email') private readonly mailQueue: Queue,
  ) {}

  onModuleInit() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not fully configured. Emails will NOT be sent.');
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;
    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user,
        pass,
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('Failed to verify SMTP connection', error.stack);
      this.logger.error(
        'Email notifications will not work until SMTP is properly configured',
      );
    }
  }

  isConfiguredWithRealSmtp(): boolean {
    return this.isConfigured;
  }

  getConfigStatus() {
    return {
      configured: this.isConfigured,
      host: process.env.SMTP_HOST || 'not set',
      port: process.env.SMTP_PORT || '587',
      from: process.env.SMTP_FROM || 'not set',
    };
  }

  async sendAdmissionReceived(to: string, studentName: string, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const name = this.escapeHtml(studentName);
    const template: EmailTemplate = {
      headerColor: '#2563EB',
      headerTitle: 'Basaer College',
      headerSubtitle: 'Raising Leaders through Quran & Science  |  تربية الأجيال على القرآن والعلوم',
      greeting: 'السلام عليكم ورحمة الله وبركاته',
      bodyContent: `
        <div dir="rtl">
          <p>نشكركم على تقديم طلب التسجيل، ويسرنا تأكيد استلام طلب تسجيل الطالب <strong>${name}</strong> في أكاديمية البصائر للعلوم القرآنية والعصرية.</p>
          <p>سيتم مراجعة المستندات وإثبات الدفع من قبل لجنة القبول، وسنوافيكم بآخر المستجدات فور الانتهاء من عملية التحقق.</p>
        </div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
        <div>
          <p>Dear Guardian,</p>
          <p>We hereby acknowledge the receipt of your admission application for <strong>${name}</strong> at Basaer Academy for Quranic and Contemporary Sciences.</p>
          <p>The Admissions Committee is currently reviewing the submitted documents and payment confirmation. You will be notified of the outcome upon completion of the verification process.</p>
        </div>
      `,
      extraBlocks: [
        {
          backgroundColor: '#f0f4ff',
          padding: '20px',
          content: `
          <div dir="rtl">
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1e40af;">الخطوات التالية:</p>
            <ul style="margin: 10px 0 0; padding-right: 20px;">
              <li>التحقق من الدفع (1-2 يوم عمل)</li>
              <li>مراجعة المستندات</li>
              <li>دعوة للمقابلة الشخصية / الاختبار</li>
            </ul>
          </div>
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #d0d0d0;" />
          <div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1e40af;">Next Steps:</p>
            <ul style="margin: 10px 0 0; padding-left: 20px;">
              <li>Payment Verification (1-2 business days)</li>
              <li>Document Review</li>
              <li>Entrance Interview / Test Invitation</li>
            </ul>
          </div>
        `,
        },
      ],
      footerText:
        'للاستفسار، يُرجى الرد على هذا البريد أو الاتصال بنا على +234 800 BASAER | For inquiries, please reply to this email or contact us at +234 800 BASAER',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `تأكيد استلام طلب التسجيل | Application Received: ${name}`, html, branchId);
  }

  async sendApprovalEmail(to: string, studentName: string, studentId: string, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#10b981',
      headerTitle: 'Congratulations!',
      headerSubtitle: 'Admission Approved for Basaer College',
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>We are delighted to inform you that the admission application for <strong>${this.escapeHtml(studentName)}</strong> has been <strong>APPROVED</strong>.</p>
      `,
      extraBlocks: [
        {
          backgroundColor: '#f0fdf4',
          borderColor: '#10b981',
          borderSide: '2px dashed',
          padding: '20px',
          content: `
          <p style="margin: 0; font-size: 12px; font-weight: bold; color: #059669; text-transform: uppercase;">Student ID / Admission No</p>
          <p style="margin: 5px 0 0; font-size: 32px; font-weight: 900; color: #064e3b; letter-spacing: 2px;">${this.escapeHtml(studentId)}</p>
        `,
        },
      ],
      footerText:
        'The student has been successfully enrolled in our system. A parent portal account has been created for you using this email address. Please visit the school office to collect the orientation package and uniform.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Admission Approved: ${studentName}`, html, branchId);
  }

  async sendRejectionEmail(to: string, studentName: string, reason: string, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#ef4444',
      headerTitle: 'Admission Update',
      headerSubtitle: '',
      greeting: 'Hello,',
      bodyContent: `
        <p>Thank you for your interest in Basaer Quranic and Science College.</p>
        <p>We regret to inform you that we cannot proceed with the admission application for <strong>${this.escapeHtml(studentName)}</strong> at this time.</p>
      `,
      extraBlocks: [
        {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          borderSide: 'left: 4px solid',
          padding: '20px',
          content: `
          <p style="margin: 0; font-weight: bold; font-size: 14px; color: #991b1b;">Reason for this decision:</p>
          <p style="margin: 5px 0 0; color: #b91c1c;">${this.escapeHtml(reason)}</p>
        `,
        },
      ],
      footerText:
        'If this was due to missing documents, you are welcome to submit a new application once you have all the requirements ready.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(
      to,
      `Update on Admission Application: ${studentName}`,
      html,
      branchId,
    );
  }

  async sendInterviewInvitation(to: string, studentName: string, interviewDate: string, venue: string, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#8b5cf6',
      headerTitle: 'Interview Invitation',
      headerSubtitle: 'Basaer Quranic and Science College',
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>We are pleased to inform you that your admission application for <strong>${this.escapeHtml(studentName)}</strong> has been reviewed and you have been invited for an interview.</p>
      `,
      extraBlocks: [
        {
          backgroundColor: '#f5f3ff',
          borderColor: '#8b5cf6',
          borderSide: 'left: 4px solid',
          padding: '20px',
          content: `
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #6d28d9;">Interview Details:</p>
            <p style="margin: 10px 0 0;"><strong>Date & Time:</strong> ${this.escapeHtml(interviewDate)}</p>
            <p style="margin: 5px 0 0;"><strong>Venue:</strong> ${this.escapeHtml(venue)}</p>
            <p style="margin: 5px 0 0;"><strong>Please bring:</strong> Original documents, passport photos, and any certificates.</p>
          `,
        },
      ],
      footerText: 'Please arrive 15 minutes early. If you need to reschedule, contact the admissions office.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Interview Invitation: ${studentName}`, html, branchId);
  }

  async sendExamInvitation(to: string, studentName: string, examDate: string, venue: string, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#f59e0b',
      headerTitle: 'Entrance Exam Invitation',
      headerSubtitle: 'Basaer Quranic and Science College',
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>Your admission application for <strong>${this.escapeHtml(studentName)}</strong> has progressed to the entrance examination stage.</p>
      `,
      extraBlocks: [
        {
          backgroundColor: '#fffbeb',
          borderColor: '#f59e0b',
          borderSide: 'left: 4px solid',
          padding: '20px',
          content: `
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #92400e;">Exam Details:</p>
            <p style="margin: 10px 0 0;"><strong>Date & Time:</strong> ${this.escapeHtml(examDate)}</p>
            <p style="margin: 5px 0 0;"><strong>Venue:</strong> ${this.escapeHtml(venue)}</p>
            <p style="margin: 5px 0 0;"><strong>Please bring:</strong> Pens, pencils, eraser, and calculator (if permitted).</p>
          `,
        },
      ],
      footerText: 'Late arrivals will not be permitted. Contact the admissions office for any queries.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Entrance Exam: ${studentName}`, html, branchId);
  }

  async sendAdmissionOffer(to: string, studentName: string, offeredClass: string, offeredSection: string, deadline: Date, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const deadlineStr = deadline.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const template: EmailTemplate = {
      headerColor: '#10b981',
      headerTitle: 'Admission Offer',
      headerSubtitle: 'Congratulations!',
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>We are delighted to offer admission to <strong>${this.escapeHtml(studentName)}</strong> at Basaer Quranic and Science College.</p>
      `,
      extraBlocks: [
        {
          backgroundColor: '#f0fdf4',
          borderColor: '#10b981',
          borderSide: '2px dashed',
          padding: '20px',
          content: `
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #059669; text-transform: uppercase;">Offer Details</p>
            <p style="margin: 10px 0 0;"><strong>Class:</strong> ${this.escapeHtml(offeredClass)}</p>
            <p style="margin: 5px 0 0;"><strong>Section:</strong> ${this.escapeHtml(offeredSection)}</p>
            <p style="margin: 5px 0 0;"><strong>Accept by:</strong> ${this.escapeHtml(deadlineStr)}</p>
          `,
        },
      ],
      footerText: 'To accept this offer, please visit the admissions office or respond to this email before the deadline.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Admission Offer: ${studentName}`, html, branchId);
  }

  async sendOfferExpired(to: string, studentName: string, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#ef4444',
      headerTitle: 'Offer Expired',
      headerSubtitle: 'Basaer Quranic and Science College',
      greeting: 'Hello,',
      bodyContent: `
        <p>The admission offer for <strong>${this.escapeHtml(studentName)}</strong> has expired as we did not receive a response within the deadline.</p>
        <p>Your application has been placed on our waitlist. If a spot becomes available, we will contact you with a new offer.</p>
      `,
      footerText: 'If you still wish to proceed, please contact the admissions office.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Admission Offer Expired: ${studentName}`, html, branchId);
  }

  async sendWaitlistNotification(to: string, studentName: string, position: number, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#6366f1',
      headerTitle: 'Waitlist Notification',
      headerSubtitle: 'Basaer Quranic and Science College',
      greeting: 'Hello,',
      bodyContent: `
        <p>Thank you for your interest in Basaer Quranic and Science College. Your application for <strong>${this.escapeHtml(studentName)}</strong> has been placed on our waitlist.</p>
      `,
      extraBlocks: [
        {
          backgroundColor: '#eef2ff',
          borderColor: '#6366f1',
          borderSide: 'left: 4px solid',
          padding: '20px',
          content: `
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #3730a3;">Waitlist Position: #${position}</p>
            <p style="margin: 10px 0 0;">You will be contacted if a spot becomes available in your desired class.</p>
          `,
        },
      ],
      footerText: 'You may still be contacted for future admission cycles.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Waitlist Notification: ${studentName}`, html, branchId);
  }

  async sendPasswordReset(to: string, resetLink: string, branchId?: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#2563EB',
      headerTitle: 'Basaer Portal',
      headerSubtitle: 'Raising Leaders through Quran & Science',
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>We received a request to reset the password for your Basaer account.</p>
        <p>Please click the button below to reset your password. This link is valid for 15 minutes.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      `,
      footerText:
        'If the button above does not work, copy and paste this URL into your browser:\n' +
        resetLink,
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, 'Reset Your Password - Basaer', html, branchId);
  }

  // ─── Event Application Notification Emails ──────────────────────────────────

  async sendEventApplicationApproved(
    to: string,
    studentName: string,
    eventTitle: string,
    branchId?: string,
  ) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#059669',
      headerTitle: 'Application Approved',
      headerSubtitle: this.escapeHtml(eventTitle),
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>We are pleased to inform you that the application for <strong>${this.escapeHtml(studentName)}</strong> to <strong>${this.escapeHtml(eventTitle)}</strong> has been <strong>APPROVED</strong>.</p>
        <p>Please find attached the camp requirements and prohibited items documents for your reference. Review them carefully before the event date.</p>
      `,
      footerText:
        'We look forward to seeing you at the event. If you have any questions, please contact the event coordinator.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Application Approved: ${studentName} - ${eventTitle}`, html, branchId, [
      { filename: 'camp-requirements.pdf', path: this.getDocumentPath('camp-requirements.pdf') },
      { filename: 'prohibited-items.pdf', path: this.getDocumentPath('prohibited-items.pdf') },
    ]);
  }

  async sendEventApplicationRejected(
    to: string,
    studentName: string,
    eventTitle: string,
    reason: string,
    branchId?: string,
  ) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#dc2626',
      headerTitle: 'Application Status Update',
      headerSubtitle: this.escapeHtml(eventTitle),
      greeting: 'Hello,',
      bodyContent: `
        <p>Thank you for applying to <strong>${this.escapeHtml(eventTitle)}</strong>.</p>
        <p>After careful review, we regret to inform you that the application for <strong>${this.escapeHtml(studentName)}</strong> has been <strong>REJECTED</strong>.</p>
      `,
      extraBlocks: [
        {
          backgroundColor: '#fef2f2',
          borderColor: '#dc2626',
          borderSide: 'left: 4px solid',
          padding: '20px',
          content: `
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #991b1b;">Reason:</p>
            <p style="margin: 5px 0 0; color: #b91c1c;">${this.escapeHtml(reason)}</p>
          `,
        },
      ],
      footerText:
        'You are welcome to apply for future events. Contact support for more information.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Application Rejected: ${studentName} - ${eventTitle}`, html, branchId);
  }

  async sendEventPaymentVerified(
    to: string,
    studentName: string,
    eventTitle: string,
    branchId?: string,
  ) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#059669',
      headerTitle: 'Payment Verified',
      headerSubtitle: this.escapeHtml(eventTitle),
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>Great news! The payment for <strong>${this.escapeHtml(studentName)}</strong>'s application to <strong>${this.escapeHtml(eventTitle)}</strong> has been <strong>VERIFIED</strong>.</p>
        <p>Your spot is now confirmed. Please find attached the camp requirements and prohibited items documents.</p>
      `,
      footerText:
        'We look forward to having you at the event. Check the event page for updates and announcements.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Payment Verified: ${studentName} - ${eventTitle}`, html, branchId, [
      { filename: 'camp-requirements.pdf', path: this.getDocumentPath('camp-requirements.pdf') },
      { filename: 'prohibited-items.pdf', path: this.getDocumentPath('prohibited-items.pdf') },
    ]);
  }

  /**
   * Build a consistent email HTML template
   */
  private buildEmailTemplate(template: EmailTemplate): string {
    const extraBlocksHtml = template.extraBlocks
      ? template.extraBlocks
          .map((block) => {
            const borderStyle = block.borderSide
              ? `border-${block.borderSide}${block.borderColor ? ` ${block.borderColor}` : ''}`
              : '';
            return `
            <div style="background-color: ${block.backgroundColor}; ${borderStyle ? `border: ${borderStyle};` : ''} padding: ${block.padding}; border-radius: 10px; margin: 20px 0;">
              ${block.content}
            </div>
          `;
          })
          .join('')
      : '';

    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);" dir="ltr">
        <div style="background-color: ${template.headerColor}; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-style: italic; text-transform: uppercase; font-size: 28px;">${template.headerTitle}</h1>
          ${template.headerSubtitle ? `<p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">${template.headerSubtitle}</p>` : ''}
        </div>
        <div style="padding: 40px; color: #333; line-height: 1.8; font-size: 15px;">
          <h2 style="color: ${template.headerColor}; margin-top: 0; margin-bottom: 20px;">${template.greeting}</h2>
          ${template.bodyContent}
          ${extraBlocksHtml}
          ${template.footerText ? `<div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #64748b; font-size: 13px; line-height: 1.6;">${template.footerText}</div>` : ''}
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Basaer Quranic and Science College. All rights reserved.
        </div>
      </div>
    `;
  }

  /**
   * Validate email address format
   */
  private validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Escape HTML to prevent XSS in email templates
   */
  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private getDocumentPath(filename: string): string {
    return require('path').join(__dirname, '..', '..', 'public', 'documents', filename);
  }

  async sendMailDirect(
    to: string,
    subject: string,
    html: string,
    attachments?: { filename: string; path?: string; content?: Buffer }[],
  ) {
    if (!this.isConfigured || !this.transporter) {
      this.logger.error(`Cannot send email to ${to}. SMTP not configured.`);
      throw new Error('SMTP not configured');
    }
    const from = `"Basaer Admissions" <${process.env.SMTP_FROM || 'basaaerschools@gmail.com'}>`;
    const info = await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
    });

    this.logger.log(
      `✅ Email sent to ${to} | Subject: "${subject}" | MessageId: ${info.messageId}${attachments?.length ? ` | Attachments: ${attachments.length}` : ''}`,
    );

    if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      this.logger.log(`📧 Ethereal preview: ${previewUrl}`);
    }

    return info;
  }

  private wrapWithTemplate(body: string, branding: { name: string; logoUrl?: string | null; primaryColor: string; address?: string; phone?: string; email?: string; emailFooter?: string | null }): string {
    const logoHtml = branding.logoUrl
      ? `<img src="${branding.logoUrl}" alt="${this.escapeHtml(branding.name)}" style="max-height:50px;margin-bottom:8px;" />`
      : '';
    const header = `
      <div style="background-color:${branding.primaryColor};padding:25px 40px;text-align:center;">
        ${logoHtml}
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:bold;">${this.escapeHtml(branding.name)}</h1>
      </div>`;
    const footer = `
      <div style="background-color:#f1f5f9;padding:20px;text-align:center;color:#64748b;font-size:12px;">
        ${this.escapeHtml(branding.name)}<br/>
        ${branding.address ? this.escapeHtml(branding.address) + '<br/>' : ''}
        ${branding.phone ? 'Phone: ' + this.escapeHtml(branding.phone) + '<br/>' : ''}
        ${branding.email ? 'Email: ' + this.escapeHtml(branding.email) + '<br/>' : ''}
        ${branding.emailFooter ? this.escapeHtml(branding.emailFooter) + '<br/>' : ''}
        &copy; ${new Date().getFullYear()} ${this.escapeHtml(branding.name)}. All rights reserved.
      </div>`;
    return header + body + footer;
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    branchId?: string,
    attachments?: { filename: string; path?: string; content?: Buffer }[],
  ) {
    let brandedHtml = html;

    if (branchId) {
      try {
        const branding = await this.brandingService.getBranding(branchId);
        brandedHtml = this.wrapWithTemplate(html, branding);
      } catch (err) {
        this.logger.warn(`Failed to apply branding for branch ${branchId}: ${err.message}`);
      }
    }

    const job = await this.mailQueue.add(
      'send-mail',
      { to, subject, html: brandedHtml, branchId, attachments },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );

    this.logger.log(`📧 Email queued for ${to} | Subject: "${subject}" | Job: ${job.id}${attachments?.length ? ` | Attachments: ${attachments.length}` : ''}`);
    return { queued: true, jobId: job.id, message: `Email queued for ${to}` };
  }
}
