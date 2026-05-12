import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Initialize default preferences if not found
      return this.prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          language: 'en',
          sidebarCollapsed: false,
        },
      });
    }

    return preferences;
  }

  async update(
    userId: string,
    updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    const preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      return this.prisma.userPreference.create({
        data: {
          userId,
          ...updateUserPreferenceDto,
        },
      });
    }

    return this.prisma.userPreference.update({
      where: { userId },
      data: updateUserPreferenceDto,
    });
  }
}
