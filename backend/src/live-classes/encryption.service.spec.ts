import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
    let service: EncryptionService;

    beforeAll(() => {
        // Set required environment variables for testing
        process.env.ENCRYPTION_SECRET = 'test-secret-key-for-encryption-testing-2026';
        process.env.ENCRYPTION_SALT = 'test-salt-for-encryption';
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EncryptionService],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    describe('encrypt and decrypt', () => {
        it('should encrypt and decrypt text correctly', () => {
            const originalText = 'This is a secret message';

            const encrypted = service.encrypt(originalText);
            expect(encrypted).toBeDefined();
            expect(encrypted).not.toBe(originalText);
            expect(encrypted).toContain(':'); // Should have IV:encrypted:tag format

            const decrypted = service.decrypt(encrypted);
            expect(decrypted).toBe(originalText);
        });

        it('should produce different ciphertexts for same plaintext', () => {
            const text = 'Same message';

            const encrypted1 = service.encrypt(text);
            const encrypted2 = service.encrypt(text);

            // Different IVs should produce different ciphertexts
            expect(encrypted1).not.toBe(encrypted2);

            // But both should decrypt to the same plaintext
            expect(service.decrypt(encrypted1)).toBe(text);
            expect(service.decrypt(encrypted2)).toBe(text);
        });

        it('should handle JSON objects', () => {
            const jsonData = JSON.stringify({
                type: 'service_account',
                project_id: 'test-project',
                private_key: 'test-key',
            });

            const encrypted = service.encrypt(jsonData);
            const decrypted = service.decrypt(encrypted);

            expect(decrypted).toBe(jsonData);
            const parsed = JSON.parse(decrypted);
            expect(parsed.project_id).toBe('test-project');
        });

        it('should throw error for invalid encrypted format', () => {
            expect(() => service.decrypt('invalid-format')).toThrow('Invalid encrypted text format');
        });

        it('should throw error for tampered ciphertext', () => {
            const encrypted = service.encrypt('test');
            const [iv, ciphertext, tag] = encrypted.split(':');

            // Tamper with the ciphertext by modifying a character
            const tamperedCiphertext = ciphertext.slice(0, -1) + (ciphertext.slice(-1) === 'a' ? 'b' : 'a');
            const tampered = `${iv}:${tamperedCiphertext}:${tag}`;

            expect(() => service.decrypt(tampered)).toThrow('Decryption failed');
        });
    });

    describe('hash', () => {
        it('should create consistent hash for same input', () => {
            const text = 'password123';

            const hash1 = service.hash(text);
            const hash2 = service.hash(text);

            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
        });

        it('should create different hashes for different inputs', () => {
            const hash1 = service.hash('password1');
            const hash2 = service.hash('password2');

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('compareHash', () => {
        it('should return true for matching text and hash', () => {
            const text = 'mypassword';
            const hash = service.hash(text);

            expect(service.compareHash(text, hash)).toBe(true);
        });

        it('should return false for non-matching text and hash', () => {
            const text = 'mypassword';
            const hash = service.hash('differentpassword');

            expect(service.compareHash(text, hash)).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should throw error if ENCRYPTION_SECRET is not set', () => {
            const originalSecret = process.env.ENCRYPTION_SECRET;
            delete process.env.ENCRYPTION_SECRET;

            expect(() => service.encrypt('test')).toThrow('ENCRYPTION_SECRET environment variable is not set');

            process.env.ENCRYPTION_SECRET = originalSecret;
        });
    });
});
