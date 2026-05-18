import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

interface TaxCalculation {
  taxRateId: string;
  taxName: string;
  rate: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
}

@Injectable()
export class TaxEngineService {
  private readonly logger = new Logger(TaxEngineService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate tax for an invoice amount based on configured tax rates for the branch.
   * Returns the tax breakdown and the total including tax.
   */
  async calculateTax(
    branchId: string,
    subtotal: Decimal,
  ): Promise<{
    subtotal: Decimal;
    taxTotal: Decimal;
    grandTotal: Decimal;
    breakdown: TaxCalculation[];
  }> {
    const rates = await this.prisma.taxRate.findMany({
      where: { branchId, isActive: true, deletedAt: null },
    });

    if (rates.length === 0) {
      return {
        subtotal,
        taxTotal: new Decimal(0),
        grandTotal: subtotal,
        breakdown: [],
      };
    }

    let taxTotal = new Decimal(0);
    const breakdown: TaxCalculation[] = [];

    for (const rate of rates) {
      const rateDecimal = new Decimal(rate.rate);
      const taxAmount = subtotal.times(rateDecimal).dividedBy(100).toDecimalPlaces(2);
      taxTotal = taxTotal.plus(taxAmount);
      breakdown.push({
        taxRateId: rate.id,
        taxName: rate.name,
        rate: rateDecimal,
        taxableAmount: subtotal,
        taxAmount,
      });
    }

    return {
      subtotal,
      taxTotal,
      grandTotal: subtotal.plus(taxTotal),
      breakdown,
    };
  }

  /**
   * Get active tax rates for a branch.
   */
  async getTaxRates(branchId: string) {
    return this.prisma.taxRate.findMany({
      where: { branchId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new tax rate.
   */
  async createTaxRate(branchId: string, name: string, rate: number, type: string) {
    return this.prisma.taxRate.create({
      data: {
        name,
        rate: new Decimal(rate),
        type,
        branchId,
      },
    });
  }

  /**
   * Update a tax rate.
   */
  async updateTaxRate(id: string, data: { name?: string; rate?: number; isActive?: boolean }) {
    return this.prisma.taxRate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.rate !== undefined && { rate: new Decimal(data.rate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }
}
