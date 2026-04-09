import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // In production, these should come from environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'demo@basaeer.edu',
        pass: process.env.SMTP_PASS || 'password',
      },
    });
  }

  async sendAdmissionReceived(to: string, studentName: string) {
    const subject = `Application Received: ${studentName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #2563EB; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-style: italic; text-transform: uppercase;">Basaeer College</h1>
          <p style="margin: 10px 0 0; opacity: 0.8;">Raising Leaders through Quran & Science</p>
        </div>
        <div style="padding: 40px; color: #333; line-height: 1.6;">
          <h2 style="color: #2563EB;">Hello,</h2>
          <p>We have successfully received your admission application for <strong>${studentName}</strong>.</p>
          <p>Our registrar is currently reviewing your documents and payment proof. You will receive an update once the verification is complete.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #666; text-transform: uppercase;">Next Steps:</p>
            <ul style="margin: 10px 0 0; padding-left: 20px;">
              <li>Payment Verification (1-2 business days)</li>
              <li>Document Review</li>
              <li>Entrance Interview/Test Invitation</li>
            </ul>
          </div>
          <p>If you have any questions, please reply to this email or call us at +234 800 BASAEER.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Basaeer Quranic and Science College. All rights reserved.
        </div>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }

  async sendApprovalEmail(to: string, studentName: string, studentId: string) {
    const subject = `Admission Approved: ${studentName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #10b981; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-style: italic; text-transform: uppercase;">Congratulations!</h1>
          <p style="margin: 10px 0 0; opacity: 0.8;">Admission Approved for Basaeer College</p>
        </div>
        <div style="padding: 40px; color: #333; line-height: 1.6;">
          <h2 style="color: #10b981;">Assalamu Alaikum,</h2>
          <p>We are delighted to inform you that the admission application for <strong>${studentName}</strong> has been <strong>APPROVED</strong>.</p>
          <div style="background-color: #f0fdf4; border: 2px dashed #10b981; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #059669; text-transform: uppercase;">Student ID / Admission No</p>
            <p style="margin: 5px 0 0; font-size: 32px; font-weight: 900; color: #064e3b; letter-spacing: 2px;">${studentId}</p>
          </div>
          <p>The student has been successfully enrolled in our system. A parent portal account has been created for you using this email address.</p>
          <p>Please visit the school office to collect the orientation package and uniform.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Basaeer Quranic and Science College.
        </div>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }

  async sendRejectionEmail(to: string, studentName: string, reason: string) {
    const subject = `Update on Admission Application: ${studentName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #ef4444; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-style: italic; text-transform: uppercase;">Admission Update</h1>
        </div>
        <div style="padding: 40px; color: #333; line-height: 1.6;">
          <h2>Hello,</h2>
          <p>Thank you for your interest in Basaeer Quranic and Science College.</p>
          <p>We regret to inform you that we cannot proceed with the admission application for <strong>${studentName}</strong> at this time.</p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #991b1b;">Reason for this decision:</p>
            <p style="margin: 5px 0 0; color: #b91c1c;">${reason}</p>
          </div>
          <p>If this was due to missing documents, you are welcome to submit a new application once you have all the requirements ready.</p>
        </div>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Basaeer Admissions" <${process.env.SMTP_FROM || 'admissions@basaeer.edu'}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error;
    }
  }
}
