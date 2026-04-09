
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role, branchId: user.branchId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                branchId: user.branchId,
            }
        };
    }

    async getFullProfile(userId: string) {
        return this.usersService.findById(userId);
    }

    async createSuperAdmin() {
        return this.usersService.createSuperAdmin();
    }

    async register(data: any) {
        return this.usersService.createUser(data);
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            // Do not reveal if user exists or not
            return { message: 'If that email address is in our database, we will send you an email to reset your password.' };
        }

        // Create a unique secret based on password so the link expires once used
        const secret = (process.env.JWT_SECRET || 'fallback_secret') + user.password;
        const token = this.jwtService.sign({ sub: user.id }, { secret, expiresIn: '15m' });

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&id=${user.id}`;
        
        // TODO: Replace with real email transport (e.g. Resend, Sendgrid)
        console.log(`\n================= PASSWORD RESET LINK =================`);
        console.log(`To reset password for ${user.email}, please click:`);
        console.log(resetLink);
        console.log(`=======================================================\n`);

        return { message: 'If that email address is in our database, we will send you an email to reset your password.' };
    }

    async resetPassword(userId: string, token: string, newPasswordPlain: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('Invalid or expired password reset token');
        }

        const secret = (process.env.JWT_SECRET || 'fallback_secret') + user.password;
        
        try {
            this.jwtService.verify(token, { secret });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired password reset token');
        }

        const newHashedPassword = await bcrypt.hash(newPasswordPlain, 10);
        await this.usersService.updatePassword(user.id, newHashedPassword);
        
        return { message: 'Password has been successfully reset' };
    }
}
