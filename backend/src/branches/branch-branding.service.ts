import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchBrandingService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getBranding(branchId: string) {
    const cacheKey = `branding:${branchId}`;
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true, logoUrl: true, primaryColor: true, emailFooter: true, smsSenderId: true, address: true, phone: true, email: true },
    });

    const branding = {
      name: branch?.name || 'Basaer School',
      logoUrl: branch?.logoUrl || null,
      primaryColor: branch?.primaryColor || '#2563EB',
      emailFooter: branch?.emailFooter || null,
      smsSenderId: branch?.smsSenderId || 'BASAER',
      address: branch?.address || '',
      phone: branch?.phone || '',
      email: branch?.email || '',
    };

    await this.cacheManager.set(cacheKey, branding, 3600_000);
    return branding;
  }

  async updateBranding(branchId: string, data: { logoUrl?: string; primaryColor?: string; emailFooter?: string; smsSenderId?: string }) {
    const branch = await this.prisma.branch.update({
      where: { id: branchId },
      data,
    });
    await this.cacheManager.del(`branding:${branchId}`);
    return branch;
  }
}
