import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

export type DiscountKind = 'PERCENTAGE' | 'FIXED';

export interface DiscountInput {
  type: DiscountKind;
  value: number | string;
}

export interface DiscountCaps {
  /** Maximum allowed percentage (0–100). */
  maxPercent?: number;
  /** Maximum allowed absolute discount amount. */
  maxAmount?: Decimal;
}

/**
 * Computes and validates a discount against a gross amount (the outstanding
 * amount being discounted). Shared by every financial activity that supports
 * discounts so the rules — positive value, ≤ gross, within configured caps —
 * are enforced identically everywhere. Throws BadRequestException on any
 * violation so callers surface a clear 400.
 */
export function computeDiscount(
  gross: Decimal,
  input: DiscountInput,
  caps: DiscountCaps = {},
): { discountAmount: Decimal; netAmount: Decimal } {
  const value = new Decimal(input.value);

  if (value.lte(0)) {
    throw new BadRequestException('Discount value must be greater than zero.');
  }
  if (gross.lte(0)) {
    throw new BadRequestException('There is no outstanding amount to discount.');
  }

  let discountAmount: Decimal;

  if (input.type === 'PERCENTAGE') {
    if (value.gt(100)) {
      throw new BadRequestException('Percentage discount cannot exceed 100%.');
    }
    if (caps.maxPercent != null && value.gt(caps.maxPercent)) {
      throw new BadRequestException(
        `Discount of ${value.toString()}% exceeds the maximum allowed ${caps.maxPercent.toString()}%.`,
      );
    }
    discountAmount = gross.mul(value).div(100);
  } else {
    discountAmount = value;
  }

  discountAmount = discountAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  if (discountAmount.gt(gross)) {
    throw new BadRequestException('Discount cannot exceed the amount due.');
  }
  if (caps.maxAmount != null && discountAmount.gt(caps.maxAmount)) {
    throw new BadRequestException(
      `Discount amount exceeds the maximum allowed (${caps.maxAmount.toString()}).`,
    );
  }

  return { discountAmount, netAmount: gross.minus(discountAmount) };
}

/** Reads the configured discount caps from the environment (globally configurable). */
export function discountCapsFromEnv(): DiscountCaps {
  const maxPercent = process.env.DISCOUNT_MAX_PERCENT
    ? Number(process.env.DISCOUNT_MAX_PERCENT)
    : 100;
  const maxAmount = process.env.DISCOUNT_MAX_AMOUNT
    ? new Decimal(process.env.DISCOUNT_MAX_AMOUNT)
    : undefined;
  return { maxPercent, maxAmount };
}
