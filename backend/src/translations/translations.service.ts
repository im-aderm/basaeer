import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkUpsertTranslationsDto } from './dto/translations.dto';

@Injectable()
export class TranslationsService {
  constructor(private prisma: PrismaService) {}

  async findByLocale(locale: string, group?: string) {
    return this.prisma.translation.findMany({
      where: {
        locale,
        ...(group ? { group } : {}),
      },
    });
  }

  async bulkUpsert(dto: BulkUpsertTranslationsDto) {
    const operations = dto.translations.map((t) =>
      this.prisma.translation.upsert({
        where: {
          locale_group_key: {
            locale: t.locale,
            group: t.group,
            key: t.key,
          },
        },
        update: { value: t.value },
        create: { ...t },
      }),
    );
    return Promise.all(operations);
  }
}
