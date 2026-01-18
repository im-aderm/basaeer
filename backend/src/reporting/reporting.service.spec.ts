import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportingService', () => {
    let service: ReportingService;
    let prisma: PrismaService;

    const mockPrismaService = {
        invoice: {
            aggregate: jest.fn(),
        },
        payment: {
            aggregate: jest.fn(),
        },
        voucher: {
            aggregate: jest.fn(),
        },
        student: {
            count: jest.fn(),
        },
        onlineExam: {
            findMany: jest.fn(),
        },
        inventoryProduct: {
            count: jest.fn(),
            aggregate: jest.fn(),
        },
        staff: {
            count: jest.fn(),
        },
        user: {
            groupBy: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportingService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ReportingService>(ReportingService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getFinancialSummary', () => {
        it('should calculate financial summary correctly', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.invoice.aggregate.mockResolvedValue({
                _sum: { totalAmount: 100000 }
            });

            mockPrismaService.payment.aggregate.mockResolvedValue({
                _sum: { amount: 75000 }
            });

            mockPrismaService.voucher.aggregate.mockResolvedValue({
                _sum: { amount: 25000 }
            });

            const result = await service.getFinancialSummary(branchId);

            expect(result).toEqual({
                totalInvoiced: 100000,
                totalPaid: 75000,
                totalExpenses: 25000,
                netProfit: 50000, // 75000 - 25000
            });
        });

        it('should handle null values in aggregations', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.invoice.aggregate.mockResolvedValue({
                _sum: { totalAmount: null }
            });

            mockPrismaService.payment.aggregate.mockResolvedValue({
                _sum: { amount: null }
            });

            mockPrismaService.voucher.aggregate.mockResolvedValue({
                _sum: { amount: null }
            });

            const result = await service.getFinancialSummary(branchId);

            expect(result).toEqual({
                totalInvoiced: 0,
                totalPaid: 0,
                totalExpenses: 0,
                netProfit: 0,
            });
        });

        it('should filter by date range when provided', async () => {
            const branchId = 'test-branch-id';
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-12-31');

            mockPrismaService.invoice.aggregate.mockResolvedValue({
                _sum: { totalAmount: 50000 }
            });

            mockPrismaService.payment.aggregate.mockResolvedValue({
                _sum: { amount: 40000 }
            });

            mockPrismaService.voucher.aggregate.mockResolvedValue({
                _sum: { amount: 15000 }
            });

            await service.getFinancialSummary(branchId, startDate, endDate);

            expect(mockPrismaService.invoice.aggregate).toHaveBeenCalledWith({
                where: {
                    branchId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
                _sum: { totalAmount: true }
            });
        });
    });

    describe('getAcademicPerformance', () => {
        it('should return academic performance metrics', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.student.count.mockResolvedValue(150);

            mockPrismaService.onlineExam.findMany.mockResolvedValue([
                {
                    title: 'Math Exam',
                    attempts: [
                        { score: 85 },
                        { score: 90 },
                        { score: 78 },
                    ]
                },
                {
                    title: 'Science Exam',
                    attempts: [
                        { score: 92 },
                        { score: 88 },
                    ]
                }
            ]);

            const result = await service.getAcademicPerformance(branchId);

            expect(result.totalStudents).toBe(150);
            expect(result.recentExamStats).toHaveLength(2);
            expect(result.recentExamStats[0]).toEqual({
                title: 'Math Exam',
                avgScore: 84.33333333333333, // (85 + 90 + 78) / 3
                totalParticipants: 3,
            });
        });

        it('should handle exams with no attempts', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.student.count.mockResolvedValue(100);

            mockPrismaService.onlineExam.findMany.mockResolvedValue([
                {
                    title: 'Empty Exam',
                    attempts: []
                }
            ]);

            const result = await service.getAcademicPerformance(branchId);

            expect(result.recentExamStats[0]).toEqual({
                title: 'Empty Exam',
                avgScore: 0,
                totalParticipants: 0,
            });
        });
    });

    describe('getInventoryStats', () => {
        it('should return inventory statistics', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.inventoryProduct.count
                .mockResolvedValueOnce(50) // total products
                .mockResolvedValueOnce(5); // low stock items

            mockPrismaService.inventoryProduct.aggregate.mockResolvedValue({
                _sum: { stock: 1500 }
            });

            const result = await service.getInventoryStats(branchId);

            expect(result).toEqual({
                totalProducts: 50,
                lowStockItems: 5,
                totalUnits: 1500,
            });
        });

        it('should handle zero inventory', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.inventoryProduct.count
                .mockResolvedValueOnce(0)
                .mockResolvedValueOnce(0);

            mockPrismaService.inventoryProduct.aggregate.mockResolvedValue({
                _sum: { stock: null }
            });

            const result = await service.getInventoryStats(branchId);

            expect(result).toEqual({
                totalProducts: 0,
                lowStockItems: 0,
                totalUnits: 0,
            });
        });
    });

    describe('getHRStats', () => {
        it('should return HR statistics with role distribution', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.staff.count.mockResolvedValue(25);

            mockPrismaService.user.groupBy.mockResolvedValue([
                { role: 'TEACHER', _count: { _all: 15 } },
                { role: 'ACCOUNTANT', _count: { _all: 3 } },
                { role: 'HR', _count: { _all: 2 } },
                { role: 'LIBRARIAN', _count: { _all: 5 } },
            ]);

            const result = await service.getHRStats(branchId);

            expect(result.totalStaff).toBe(25);
            expect(result.roleDistribution).toHaveLength(4);
            expect(result.roleDistribution[0]).toEqual({
                role: 'TEACHER',
                count: 15,
            });
        });
    });

    describe('getUnifiedDashboard', () => {
        it('should aggregate all dashboard metrics', async () => {
            const branchId = 'test-branch-id';

            // Mock all dependencies
            mockPrismaService.invoice.aggregate.mockResolvedValue({
                _sum: { totalAmount: 100000 }
            });
            mockPrismaService.payment.aggregate.mockResolvedValue({
                _sum: { amount: 75000 }
            });
            mockPrismaService.voucher.aggregate.mockResolvedValue({
                _sum: { amount: 25000 }
            });
            mockPrismaService.student.count.mockResolvedValue(150);
            mockPrismaService.onlineExam.findMany.mockResolvedValue([]);
            mockPrismaService.inventoryProduct.count
                .mockResolvedValueOnce(50)
                .mockResolvedValueOnce(5);
            mockPrismaService.inventoryProduct.aggregate.mockResolvedValue({
                _sum: { stock: 1500 }
            });
            mockPrismaService.staff.count.mockResolvedValue(25);
            mockPrismaService.user.groupBy.mockResolvedValue([]);

            const result = await service.getUnifiedDashboard(branchId);

            expect(result).toHaveProperty('finance');
            expect(result).toHaveProperty('academic');
            expect(result).toHaveProperty('inventory');
            expect(result).toHaveProperty('hr');
            expect(result.finance.netProfit).toBe(50000);
            expect(result.academic.totalStudents).toBe(150);
            expect(result.inventory.totalProducts).toBe(50);
            expect(result.hr.totalStaff).toBe(25);
        });
    });

    describe('PDF Export Methods', () => {
        it('should generate student performance PDF', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.student.count.mockResolvedValue(100);
            mockPrismaService.onlineExam.findMany.mockResolvedValue([
                {
                    title: 'Test Exam',
                    attempts: [{ score: 85 }]
                }
            ]);

            const result = await service.exportStudentPerformancePDF(branchId);

            expect(result).toBeInstanceOf(Buffer);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should generate fees PDF', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.invoice.aggregate.mockResolvedValue({
                _sum: { totalAmount: 100000 }
            });
            mockPrismaService.payment.aggregate.mockResolvedValue({
                _sum: { amount: 75000 }
            });
            mockPrismaService.voucher.aggregate.mockResolvedValue({
                _sum: { amount: 25000 }
            });

            const result = await service.exportFeesPDF(branchId);

            expect(result).toBeInstanceOf(Buffer);
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('Excel Export Methods', () => {
        it('should generate student performance Excel', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.student.count.mockResolvedValue(100);
            mockPrismaService.onlineExam.findMany.mockResolvedValue([
                {
                    title: 'Test Exam',
                    attempts: [{ score: 85 }]
                }
            ]);

            const result = await service.exportStudentPerformanceExcel(branchId);

            expect(result).toBeDefined();
            expect(result.byteLength).toBeGreaterThan(0);
        });

        it('should generate fees Excel', async () => {
            const branchId = 'test-branch-id';

            mockPrismaService.invoice.aggregate.mockResolvedValue({
                _sum: { totalAmount: 100000 }
            });
            mockPrismaService.payment.aggregate.mockResolvedValue({
                _sum: { amount: 75000 }
            });
            mockPrismaService.voucher.aggregate.mockResolvedValue({
                _sum: { amount: 25000 }
            });

            const result = await service.exportFeesExcel(branchId);

            expect(result).toBeDefined();
            expect(result.byteLength).toBeGreaterThan(0);
        });
    });
});
