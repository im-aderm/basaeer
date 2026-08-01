import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface DecodedResultCode {
  studentId: string;
  sessionId: string;
  term: string;
}

/**
 * Stateless, signed result-verification codes rather than a stored
 * verification row (the TranscriptVerification pattern used for full
 * transcripts). No DB write is needed to mint one, so publishing a term's
 * results doesn't need a migration to a database this sandbox can't reach
 * to verify against — the code is just an HMAC over (studentId, sessionId,
 * term) derived from the already-required JWT_SECRET (with a distinct
 * derivation context, so this doesn't reuse the JWT signing key directly).
 * "Revocation" falls out for free: verifying re-checks ResultPublication
 * live, so un-publishing a result makes every previously-issued code for it
 * stop resolving without needing a revokedAt flag anywhere.
 */
@Injectable()
export class ResultVerificationService {
  constructor(private readonly configService: ConfigService) {}

  private getSigningKey(): Buffer {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    return crypto
      .createHmac('sha256', secret)
      .update('result-verification-v1')
      .digest();
  }

  private sign(payload: string): string {
    return crypto
      .createHmac('sha256', this.getSigningKey())
      .update(payload)
      .digest('hex')
      .slice(0, 32);
  }

  generateCode(studentId: string, sessionId: string, term: string): string {
    const payload = `${studentId}:${sessionId}:${term}`;
    const signature = this.sign(payload);
    return Buffer.from(`${payload}:${signature}`, 'utf8').toString('base64url');
  }

  verifyCode(code: string): DecodedResultCode | null {
    try {
      const decoded = Buffer.from(code, 'base64url').toString('utf8');
      const parts = decoded.split(':');
      if (parts.length !== 4) return null;
      const [studentId, sessionId, term, signature] = parts;
      const expected = this.sign(`${studentId}:${sessionId}:${term}`);
      const signatureBuf = Buffer.from(signature, 'hex');
      const expectedBuf = Buffer.from(expected, 'hex');
      if (
        signatureBuf.length !== expectedBuf.length ||
        !crypto.timingSafeEqual(signatureBuf, expectedBuf)
      ) {
        return null;
      }
      return { studentId, sessionId, term };
    } catch {
      return null;
    }
  }

  verificationUrl(studentId: string, sessionId: string, term: string): string {
    const code = this.generateCode(studentId, sessionId, term);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/result-checker?code=${code}`;
  }
}
