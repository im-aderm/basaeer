import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UserRole } from '../generated/client/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getPermissions(role?: UserRole) {
    return this.prisma.rolePermission.findMany({
      where: role ? { role } : {},
    });
  }

  async updatePermission(dto: UpdatePermissionDto) {
    return this.prisma.rolePermission.upsert({
      where: {
        role_module_action: {
          role: dto.role,
          module: dto.module,
          action: dto.action,
        },
      },
      update: { isAllowed: dto.isAllowed },
      create: {
        role: dto.role,
        module: dto.module,
        action: dto.action,
        isAllowed: dto.isAllowed,
      },
    });
  }

  async bulkUpdatePermissions(
    role: UserRole,
    permissions: Partial<UpdatePermissionDto>[],
  ) {
    return this.prisma.$transaction(
      permissions.map((p) =>
        this.prisma.rolePermission.upsert({
          where: {
            role_module_action: {
              role: role,
              module: p.module!,
              action: p.action!,
            },
          },
          update: { isAllowed: p.isAllowed },
          create: {
            role: role,
            module: p.module!,
            action: p.action!,
            isAllowed: p.isAllowed || false,
          },
        }),
      ),
    );
  }

  async checkPermission(
    role: UserRole,
    module: string,
    action: string,
  ): Promise<boolean> {
    if (role === UserRole.SUPER_ADMIN) return true;

    const permission = await this.prisma.rolePermission.findUnique({
      where: {
        role_module_action: {
          role,
          module,
          action,
        },
      },
    });

    return permission ? permission.isAllowed : false;
  }

  async seedInitialPermissions() {
    const roles = Object.values(UserRole);
    const modules = [
      'Dashboard',
      'Core Administration',
      'Branches',
      'Academic Sessions',
      'Classes & Sections',
      'Subjects',
      'Student Admission',
      'Student Profile',
      'Student Attendance',
      'Examination Configuration',
      'Mark Entry',
      'Academic Reports',
      'Online Exams',
      'Student Accounting',
      'Office Accounting',
      'Human Resource',
      'Payroll',
      'Leave Management',
      'Library',
      'Hostel',
      'Transport',
      'Inventory',
      'Front Office',
      'Communication (SMS/Email)',
      'Events',
      'Reporting & Analytics',
      'System Settings',
    ];
    const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

    for (const role of roles) {
      for (const module of modules) {
        for (const action of actions) {
          await this.prisma.rolePermission.upsert({
            where: {
              role_module_action: {
                role,
                module,
                action,
              },
            },
            update: {},
            create: {
              role,
              module,
              action,
              isAllowed: role === UserRole.SUPER_ADMIN, // Only Super Admin allowed by default
            },
          });
        }
      }
    }
  }
}
