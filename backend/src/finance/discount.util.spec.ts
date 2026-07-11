import { Decimal } from '@prisma/client/runtime/library';
import { BadRequestException } from '@nestjs/common';
import { computeDiscount } from './discount.util';

const D = (n: number | string) => new Decimal(n);

describe('computeDiscount', () => {
  it('computes a percentage discount of the outstanding amount', () => {
    const { discountAmount, netAmount } = computeDiscount(D(1000), {
      type: 'PERCENTAGE',
      value: 10,
    });
    expect(discountAmount.toString()).toBe('100');
    expect(netAmount.toString()).toBe('900');
  });

  it('computes a fixed discount', () => {
    const { discountAmount, netAmount } = computeDiscount(D(1000), {
      type: 'FIXED',
      value: 250,
    });
    expect(discountAmount.toString()).toBe('250');
    expect(netAmount.toString()).toBe('750');
  });

  it('rounds to 2 decimal places', () => {
    const { discountAmount } = computeDiscount(D(999.99), {
      type: 'PERCENTAGE',
      value: 33.333,
    });
    expect(discountAmount.decimalPlaces()).toBeLessThanOrEqual(2);
  });

  it('rejects a value of zero or below', () => {
    expect(() => computeDiscount(D(1000), { type: 'FIXED', value: 0 })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a percentage over 100', () => {
    expect(() =>
      computeDiscount(D(1000), { type: 'PERCENTAGE', value: 150 }),
    ).toThrow(BadRequestException);
  });

  it('rejects a fixed discount greater than the amount due', () => {
    expect(() =>
      computeDiscount(D(500), { type: 'FIXED', value: 600 }),
    ).toThrow(/cannot exceed the amount due/);
  });

  it('enforces the configured max-percent cap', () => {
    expect(() =>
      computeDiscount(D(1000), { type: 'PERCENTAGE', value: 40 }, { maxPercent: 25 }),
    ).toThrow(/maximum allowed 25%/);
  });

  it('enforces the configured max-amount cap', () => {
    expect(() =>
      computeDiscount(
        D(10000),
        { type: 'FIXED', value: 5000 },
        { maxAmount: D(1000) },
      ),
    ).toThrow(/exceeds the maximum allowed/);
  });

  it('allows a full 100% waiver when uncapped', () => {
    const { netAmount } = computeDiscount(D(1000), {
      type: 'PERCENTAGE',
      value: 100,
    });
    expect(netAmount.toString()).toBe('0');
  });
});
