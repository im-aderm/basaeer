import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class QRService {
    private readonly secret: string;

    constructor(configService: ConfigService) {
        this.secret = configService.get<string>('QR_SIGNING_SECRET') || 'basaeer-qr-default-secret-2026';
    }

    generateSignature(studentId: string, branchId: string): string {
        const data = `${studentId}:${branchId}`;
        return crypto
            .createHmac('sha256', this.secret)
            .update(data)
            .digest('hex');
    }

    verifySignature(studentId: string, branchId: string, signature: string): boolean {
        const expected = this.generateSignature(studentId, branchId);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        );
    }

    generateQRPayload(studentId: string, branchId: string): string {
        const signature = this.generateSignature(studentId, branchId);
        const payload = {
            s: studentId,
            b: branchId,
            v: signature.substring(0, 16) // Shorten signature for smaller QR codes
        };
        return JSON.stringify(payload);
    }

    // Verify shortened payload
    verifyQRPayload(payloadStr: string): { studentId: string, branchId: string } {
        try {
            const payload = JSON.parse(payloadStr);
            const { s: studentId, b: branchId, v: signatureShort } = payload;
            
            const fullSignature = this.generateSignature(studentId, branchId);
            if (fullSignature.substring(0, 16) !== signatureShort) {
                throw new UnauthorizedException('Invalid QR Signature');
            }

            return { studentId, branchId };
        } catch (e) {
            throw new UnauthorizedException('Invalid QR Payload');
        }
    }
}
