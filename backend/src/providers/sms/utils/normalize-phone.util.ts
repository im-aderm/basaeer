/**
 * Normalizes a phone number to the Nigerian format (234...)
 * Removes leading 0 or + and ensures it starts with 234
 */
export function normalizeNigerianPhone(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // If it starts with + (removed above) or 0, remove the leading 0
  if (phone.startsWith('0')) {
    cleaned = cleaned.substring(1);
  } else if (phone.startsWith('+234')) {
    cleaned = cleaned.substring(3);
  } else if (phone.startsWith('234')) {
    cleaned = cleaned.substring(3);
  }

  // At this point cleaned should be the number without leading 0 or 234
  // Ensure it's 10 digits (for Nigerian numbers without prefix)
  // Standard Nigerian mobile numbers are 11 digits starting with 0, so 10 digits after removing 0

  return `234${cleaned}`;
}
