import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) return false;

    const changePasswordPath = '/auth/change-password';

    if (request.route?.path === changePasswordPath || request.url?.includes(changePasswordPath)) {
      return true;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { mustChangePassword: true },
    });

    if (dbUser?.mustChangePassword) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'You must change your password before accessing this resource',
        code: 'PASSWORD_CHANGE_REQUIRED',
      });
    }

    return true;
  }
}
