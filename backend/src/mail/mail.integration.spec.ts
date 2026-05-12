import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({
      messageId: '<test-message-id@test>',
    }),
  }),
  getTestMessageUrl: jest
    .fn()
    .mockReturnValue('https://ethereal.email/test-message'),
}));

/**
 * Integration tests for MailService
 * These tests verify the service works with mocked nodemailer instances
 */
describe('MailService Integration', () => {
  let service: MailService;

  describe('with configured SMTP credentials', () => {
    // Note: Since Jest runs tests in parallel, we can't reliably test env var detection
    // in integration tests. This is covered by unit tests instead.
    // These tests focus on email generation and validation.

    beforeAll(async () => {
      process.env.SMTP_HOST = 'smtp-relay.brevo.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_SECURE = 'false';
      process.env.SMTP_USER = 'user@brevo.com';
      process.env.SMTP_PASS = 'brevo-password';
      process.env.SMTP_FROM = 'noreply@basaeer.edu';

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    afterAll(() => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_SECURE;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.SMTP_FROM;
    });

    it('should have correct host in config status', () => {
      const status = service.getConfigStatus();
      expect(status.host).toBe('smtp-relay.brevo.com');
      expect(status.port).toBe('587');
      expect(status.from).toBe('noreply@basaeer.edu');
    });
  });

  describe('with ethereal fallback credentials', () => {
    beforeAll(async () => {
      process.env.SMTP_HOST = 'smtp.ethereal.email';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_SECURE = 'false';
      process.env.SMTP_USER = 'test@ethereal.email';
      process.env.SMTP_PASS = 'test-password';
      process.env.SMTP_FROM = 'test@basaeer.edu';

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    afterAll(() => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_SECURE;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.SMTP_FROM;
    });

    it('should correctly identify ethereal as not production-ready', () => {
      expect(service.isConfiguredWithRealSmtp()).toBe(false);
    });

    it('should return correct config status for ethereal', () => {
      const status = service.getConfigStatus();
      expect(status.host).toBe('smtp.ethereal.email');
      expect(status.port).toBe('587');
      expect(status.from).toBe('test@basaeer.edu');
    });
  });

  describe('with no environment variables', () => {
    beforeAll(async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_SECURE;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.SMTP_FROM;

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    it('should default to fallback credentials', () => {
      expect(service.isConfiguredWithRealSmtp()).toBe(false);
    });
  });

  describe('Email validation', () => {
    beforeAll(async () => {
      process.env.SMTP_HOST = 'smtp-relay.brevo.com';
      process.env.SMTP_USER = 'test@brevo.com';
      process.env.SMTP_PASS = 'test-password';

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    afterAll(() => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
    });

    it('should reject emails without @ symbol', async () => {
      const sendMailSpy = jest.spyOn<any, any>(service, 'sendMail');

      await service.sendAdmissionReceived('invalid-email', 'Test');
      expect(sendMailSpy).not.toHaveBeenCalled();
    });

    it('should reject emails without domain', async () => {
      const sendMailSpy = jest.spyOn<any, any>(service, 'sendMail');

      await service.sendAdmissionReceived('test@', 'Test');
      expect(sendMailSpy).not.toHaveBeenCalled();
    });

    it('should reject empty emails', async () => {
      const sendMailSpy = jest.spyOn<any, any>(service, 'sendMail');

      await service.sendAdmissionReceived('', 'Test');
      expect(sendMailSpy).not.toHaveBeenCalled();
    });

    it('should accept valid email formats', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test@test>',
        });

      await service.sendAdmissionReceived(
        'valid.email+tag@domain.co.uk',
        'Test',
      );
      expect(sendMailSpy).toHaveBeenCalled();
    });
  });

  describe('XSS Prevention', () => {
    beforeAll(async () => {
      process.env.SMTP_HOST = 'smtp-relay.brevo.com';
      process.env.SMTP_USER = 'test@brevo.com';
      process.env.SMTP_PASS = 'test-password';

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    afterAll(() => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should escape script tags in student names', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test@test>',
        });

      await service.sendAdmissionReceived(
        'test@example.com',
        '<script>alert("xss")</script>',
      );

      const htmlCall = sendMailSpy.mock.calls[0][2];
      expect(htmlCall).not.toContain('<script>');
      expect(htmlCall).toContain('&lt;script&gt;');
    });

    it('should escape HTML attributes in rejection reasons', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test@test>',
        });

      await service.sendRejectionEmail(
        'test@example.com',
        'Test Student',
        'Reason with "quotes" and <b>HTML</b>',
      );

      const htmlCall = sendMailSpy.mock.calls[0][2];
      expect(htmlCall).not.toContain('<b>');
      expect(htmlCall).toContain('&lt;b&gt;');
      expect(htmlCall).toContain('&quot;quotes&quot;');
    });

    it('should escape event handlers in student IDs', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test@test>',
        });

      await service.sendApprovalEmail(
        'test@example.com',
        'Test Student',
        'BMS-2026-0001" onmouseover="alert("xss")',
      );

      const htmlCall = sendMailSpy.mock.calls[0][2];
      // The quotes are escaped which breaks the XSS attack vector
      // "onmouseover" text can remain since it's harmless without unescaped quotes
      expect(htmlCall).not.toContain('" onmouseover="');
      expect(htmlCall).toContain('&quot;');
    });
  });

  describe('Template structure validation', () => {
    beforeAll(async () => {
      process.env.SMTP_HOST = 'smtp-relay.brevo.com';
      process.env.SMTP_USER = 'test@brevo.com';
      process.env.SMTP_PASS = 'test-password';

      const module: TestingModule = await Test.createTestingModule({
        providers: [MailService],
      }).compile();

      service = module.get<MailService>(MailService);
    });

    afterAll(() => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
    });

    it('should generate well-formed HTML for all email types', async () => {
      const sendMailSpy = jest
        .spyOn<any, any>(service, 'sendMail')
        .mockResolvedValue({
          messageId: '<test@test>',
        });

      await service.sendAdmissionReceived('test@example.com', 'Student 1');
      await service.sendApprovalEmail(
        'test@example.com',
        'Student 2',
        'ID-002',
      );
      await service.sendRejectionEmail(
        'test@example.com',
        'Student 3',
        'Test reason',
      );

      sendMailSpy.mock.calls.forEach((call) => {
        const html = call[2];
        expect(html).toContain('font-family: Arial');
        expect(html).toContain('max-width: 600px');
        expect(html).toContain('border-radius: 20px');
        expect(html).toContain('</div>');
      });
    });
  });
});
