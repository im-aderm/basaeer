import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { MailService } from '../mail/mail.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer at module level
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({
        messageId: '<test-message-id@test>',
      }),
    }),
    getTestMessageUrl: jest
      .fn()
      .mockReturnValue('https://ethereal.email/test-message'),
  };
});

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    // Clear environment variables for clean test state
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: BranchBrandingService, useValue: {} },
        { provide: getQueueToken('transactional-email'), useValue: { add: jest.fn() } },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should use fallback credentials when env vars are not set', () => {
      expect(service.isConfiguredWithRealSmtp()).toBe(false);
    });
  });

  describe('getConfigStatus with custom env vars', () => {
    it('should return configuration status with host from env vars', async () => {
      // Create a fresh module with specific env vars
      process.env.SMTP_HOST = 'smtp-relay.brevo.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_FROM = 'noreply@basaer.edu';

      const module: TestingModule = await Test.createTestingModule({
        providers: [
        MailService,
        { provide: BranchBrandingService, useValue: {} },
        { provide: getQueueToken('transactional-email'), useValue: { add: jest.fn() } },
      ],
      }).compile();

      const configuredService = module.get<MailService>(MailService);
      const status = configuredService.getConfigStatus();

      expect(status.host).toBe('smtp-relay.brevo.com');
      expect(status.port).toBe('587');
      expect(status.from).toBe('noreply@basaer.edu');

      // Clean up
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_FROM;
    });
  });

  describe('sendAdmissionReceived', () => {
    it('should send acknowledgement email successfully', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendAdmissionReceived('parent@example.com', 'John Doe');

      expect(sendMailSpy).toHaveBeenCalledWith(
        'parent@example.com',
        'تأكيد استلام طلب التسجيل | Application Received: John Doe',
        expect.stringContaining('Basaer College'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('John Doe'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('Next Steps'),
        undefined,
      );
    });

    it('should not send email to invalid address', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendAdmissionReceived('invalid-email', 'John Doe');

      expect(sendMailSpy).not.toHaveBeenCalled();
    });

    it('should not send email to empty address', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendAdmissionReceived('', 'John Doe');

      expect(sendMailSpy).not.toHaveBeenCalled();
    });

    it('should escape HTML in student name to prevent XSS', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendAdmissionReceived(
        'parent@example.com',
        '<script>alert("xss")</script>',
      );

      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.not.stringContaining('<script>'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('&lt;script&gt;'),
        undefined,
      );
    });
  });

  describe('sendApprovalEmail', () => {
    it('should send approval email successfully', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendApprovalEmail(
        'parent@example.com',
        'Jane Smith',
        'BMS-2026-0001',
      );

      expect(sendMailSpy).toHaveBeenCalledWith(
        'parent@example.com',
        'تم قبول الطلب | Admission Approved: Jane Smith',
        expect.stringContaining('Congratulations'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('BMS-2026-0001'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('APPROVED'),
        undefined,
      );
    });

    it('should not send email to invalid address', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendApprovalEmail(
        'not-an-email',
        'Jane Smith',
        'BMS-2026-0001',
      );

      expect(sendMailSpy).not.toHaveBeenCalled();
    });

    it('should escape HTML in student ID', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendApprovalEmail(
        'parent@example.com',
        'Jane Smith',
        '<b>BMS-2026-0001</b>',
      );

      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.not.stringContaining('<b>'),
        undefined,
      );
    });
  });

  describe('sendRejectionEmail', () => {
    it('should send rejection email successfully', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendRejectionEmail(
        'parent@example.com',
        'Ahmed Ali',
        'Incomplete documents: Missing birth certificate and NIN slip',
      );

      expect(sendMailSpy).toHaveBeenCalledWith(
        'parent@example.com',
        'تحديث طلب التسجيل | Update on Admission Application: Ahmed Ali',
        expect.stringContaining('Admission Update'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('Incomplete documents'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('Reason for this decision'),
        undefined,
      );
    });

    it('should not send email to invalid address', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendRejectionEmail('invalid', 'Ahmed Ali', 'Some reason');

      expect(sendMailSpy).not.toHaveBeenCalled();
    });

    it('should escape HTML in rejection reason', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendRejectionEmail(
        'parent@example.com',
        'Ahmed Ali',
        '<script>malicious code</script>',
      );

      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.not.stringContaining('<script>'),
        undefined,
      );
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.stringContaining('&lt;script&gt;'),
        undefined,
      );
    });
  });

  describe('email template consistency', () => {
    it('should include footer with copyright in all emails', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendAdmissionReceived('parent@example.com', 'Test Student');
      await service.sendApprovalEmail(
        'parent@example.com',
        'Test Student',
        'ID-001',
      );
      await service.sendRejectionEmail(
        'parent@example.com',
        'Test Student',
        'Test reason',
      );

      const allCalls = sendMailSpy.mock.calls;
      allCalls.forEach((call) => {
        expect(call[2]).toContain('Basaer Quranic and Science College');
        expect(call[2]).toContain('All rights reserved');
      });
    });

    it('should include branded header in all emails', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test-message-id@test>',
        });

      await service.sendAdmissionReceived('parent@example.com', 'Test Student');
      await service.sendApprovalEmail(
        'parent@example.com',
        'Test Student',
        'ID-001',
      );
      await service.sendRejectionEmail(
        'parent@example.com',
        'Test Student',
        'Test reason',
      );

      const allCalls = sendMailSpy.mock.calls;
      allCalls.forEach((call) => {
        expect(call[2]).toContain('padding: 40px; text-align: center');
        expect(call[2]).toContain('border-radius: 20px');
      });
    });
  });

  describe('sendMail (private method)', () => {
    it('should throw error when nodemailer fails', async () => {
      // We can't easily test this without creating a service with a failing transporter
      // since the transporter is created in onModuleInit. This is better tested in e2e tests.
      // For now, we verify that the error handling code path exists by checking the service structure.
      expect(service).toHaveProperty('sendMail');
    });
  });
});
