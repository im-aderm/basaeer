
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Branch } from '../generated/client/client';

@Injectable()
export class BranchesService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.BranchCreateInput): Promise<Branch> {
        return this.prisma.branch.create({ data });
    }

    findAll(): Promise<Branch[]> {
        return this.prisma.branch.findMany();
    }

    findOne(id: string): Promise<Branch | null> {
        return this.prisma.branch.findUnique({ where: { id } });
    }

    update(id: string, data: Prisma.BranchUpdateInput): Promise<Branch> {
        return this.prisma.branch.update({
            where: { id },
            data,
        });
    }

    remove(id: string): Promise<Branch> {
        return this.prisma.branch.delete({ where: { id } });
    }
}
