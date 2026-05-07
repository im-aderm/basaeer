import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailTemplate {
  headerColor: string;
  headerTitle: string;
  headerSubtitle: string;
  greeting: string;
  bodyContent: string;
  extraBlocks?: { backgroundColor: string; borderColor?: string; borderSide?: string; padding: string; content: string }[];
  footerText?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private isConfigured = false;
  private emailQueue: { to: string; subject: string; html: string; retries: number }[] = [];
  private isProcessing = false;

  onModuleInit() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.isConfigured = !!(host && user && pass &&
      host !== 'smtp.ethereal.email' &&
      user !== 'demo@basaeer.edu' &&
      pass !== 'password'
    );

    this.transporter = nodemailer.createTransport({
      host: host || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: user || 'demo@basaeer.edu',
        pass: pass || 'password',
      },
    });

    if (this.isConfigured) {
      this.verifyConnection();
    } else {
      this.logger.warn('SMTP not configured with real credentials. Using fallback (ethereal.email). Emails will not be delivered.');
    }

    this.startQueueProcessor();
  }

  /**
   * Verify SMTP connection on startup
   */
  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('Failed to verify SMTP connection', error.stack);
      this.logger.error('Email notifications will not work until SMTP is properly configured');
    }
  }

  /**
   * Check if the mail service is properly configured
   */
  isConfiguredWithRealSmtp(): boolean {
    return this.isConfigured;
  }

  /**
   * Get SMTP configuration status
   */
  getConfigStatus() {
    return {
      configured: this.isConfigured,
      host: process.env.SMTP_HOST || 'not set',
      port: process.env.SMTP_PORT || '587',
      from: process.env.SMTP_FROM || 'not set',
    };
  }

  async sendAdmissionReceived(to: string, studentName: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#2563EB',
      headerTitle: 'Basaeer College',
      headerSubtitle: 'Raising Leaders through Quran & Science',
      greeting: 'Hello,',
      bodyContent: `
        <p>We have successfully received your admission application for <strong>${this.escapeHtml(studentName)}</strong>.</p>
        <p>Our registrar is currently reviewing your documents and payment proof. You will receive an update once the verification is complete.</p>
      `,
      extraBlocks: [{
        backgroundColor: '#f9f9f9',
        padding: '20px',
        content: `
          <p style="margin: 0; font-weight: bold; font-size: 14px; color: #666; text-transform: uppercase;">Next Steps:</p>
          <ul style="margin: 10px 0 0; padding-left: 20px;">
            <li>Payment Verification (1-2 business days)</li>
            <li>Document Review</li>
            <li>Entrance Interview/Test Invitation</li>
          </ul>
        `,
      }],
      footerText: 'If you have any questions, please reply to this email or call us at +234 800 BASAEER.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Application Received: ${studentName}`, html);
  }

  async sendApprovalEmail(to: string, studentName: string, studentId: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#10b981',
      headerTitle: 'Congratulations!',
      headerSubtitle: 'Admission Approved for Basaeer College',
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>We are delighted to inform you that the admission application for <strong>${this.escapeHtml(studentName)}</strong> has been <strong>APPROVED</strong>.</p>
      `,
      extraBlocks: [{
        backgroundColor: '#f0fdf4',
        borderColor: '#10b981',
        borderSide: '2px dashed',
        padding: '20px',
        content: `
          <p style="margin: 0; font-size: 12px; font-weight: bold; color: #059669; text-transform: uppercase;">Student ID / Admission No</p>
          <p style="margin: 5px 0 0; font-size: 32px; font-weight: 900; color: #064e3b; letter-spacing: 2px;">${this.escapeHtml(studentId)}</p>
        `,
      }],
      footerText: 'The student has been successfully enrolled in our system. A parent portal account has been created for you using this email address. Please visit the school office to collect the orientation package and uniform.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Admission Approved: ${studentName}`, html);
  }

  async sendRejectionEmail(to: string, studentName: string, reason: string) {
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
        <p>Thank you for your interest in Basaeer Quranic and Science College.</p>
        <p>We regret to inform you that we cannot proceed with the admission application for <strong>${this.escapeHtml(studentName)}</strong> at this time.</p>
      `,
      extraBlocks: [{
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        borderSide: 'left: 4px solid',
        padding: '20px',
        content: `
          <p style="margin: 0; font-weight: bold; font-size: 14px; color: #991b1b;">Reason for this decision:</p>
          <p style="margin: 5px 0 0; color: #b91c1c;">${this.escapeHtml(reason)}</p>
        `,
      }],
      footerText: 'If this was due to missing documents, you are welcome to submit a new application once you have all the requirements ready.',
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, `Update on Admission Application: ${studentName}`, html);
  }

  async sendPasswordReset(to: string, resetLink: string) {
    if (!this.validateEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}`);
      return;
    }

    const template: EmailTemplate = {
      headerColor: '#2563EB',
      headerTitle: 'Basaeer Portal',
      headerSubtitle: 'Raising Leaders through Quran & Science',
      greeting: 'Assalamu Alaikum,',
      bodyContent: `
        <p>We received a request to reset the password for your Basaeer account.</p>
        <p>Please click the button below to reset your password. This link is valid for 15 minutes.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      `,
      footerText: 'If the button above does not work, copy and paste this URL into your browser:\n' + resetLink,
    };

    const html = this.buildEmailTemplate(template);
    return this.sendMail(to, 'Reset Your Password - Basaeer', html);
  }


  /**
   * Build a consistent email HTML template
   */
  private buildEmailTemplate(template: EmailTemplate): string {
    const extraBlocksHtml = template.extraBlocks
      ? template.extraBlocks.map(block => {
          const borderStyle = block.borderSide
            ? `border-${block.borderSide}${block.borderColor ? ` ${block.borderColor}` : ''}`
            : '';
          return `
            <div style="background-color: ${block.backgroundColor}; ${borderStyle ? `border: ${borderStyle};` : ''} padding: ${block.padding}; border-radius: 10px; margin: 20px 0;">
              ${block.content}
            </div>
          `;
        }).join('')
      : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background-color: ${template.headerColor}; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-style: italic; text-transform: uppercase; font-size: 28px;">${template.headerTitle}</h1>
          ${template.headerSubtitle ? `<p style="margin: 10px 0 0; opacity: 0.9;">${template.headerSubtitle}</p>` : ''}
        </div>
        <div style="padding: 40px; color: #333; line-height: 1.7; font-size: 15px;">
          <h2 style="color: ${template.headerColor}; margin-top: 0;">${template.greeting}</h2>
          ${template.bodyContent}
          ${extraBlocksHtml}
          ${template.footerText ? `<p style="margin-top: 20px; color: #64748b; font-size: 14px;">${template.footerText}</p>` : ''}
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Basaeer Quranic and Science College. All rights reserved.
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

  private startQueueProcessor() {
    setInterval(() => {
      this.processQueue();
    }, 5000); // Process queue every 5 seconds
  }

  private async processQueue() {
    if (this.isProcessing || this.emailQueue.length === 0) return;
    this.isProcessing = true;

    while (this.emailQueue.length > 0) {
      const email = this.emailQueue[0];
      try {
        await this.sendMailDirect(email.to, email.subject, email.html);
        this.emailQueue.shift(); // Remove successfully sent email
      } catch (error) {
        email.retries++;
        this.logger.error(`Failed to send email to ${email.to} in background (attempt ${email.retries})`, error.stack);
        if (email.retries >= 3) {
          this.logger.error(`Dropping email to ${email.to} after 3 failed attempts.`);
          this.emailQueue.shift(); // Drop after 3 retries
        } else {
          // Move to the back of the queue
          this.emailQueue.push(this.emailQueue.shift()!);
          break; // Stop processing current batch to avoid rapid spamming on connection errors
        }
      }
    }

    this.isProcessing = false;
  }

  private async sendMailDirect(to: string, subject: string, html: string) {
    const from = `"Basaeer Admissions" <${process.env.SMTP_FROM || 'admissions@basaeer.edu'}>`;
    const info = await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    this.logger.log(`✅ Email sent to ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);

    if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      this.logger.log(`📧 Ethereal preview: ${previewUrl}`);
    }

    return info;
  }

  private async sendMail(to: string, subject: string, html: string) {
    this.emailQueue.push({ to, subject, html, retries: 0 });
    this.logger.log(`📧 Email queued for ${to} | Subject: "${subject}"`);
    return { queued: true, message: `Email queued for ${to}` };
  }
}
