/**
 * Country validation utilities
 */

/**
 * Validate country ISO code (alpha-2 format)
 * @param code - 2-letter country code
 * @returns true if valid
 */
export function isValidCountryCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  return /^[A-Z]{2}$/.test(code.toUpperCase());
}

/**
 * Validate country title
 * @param title - Country name
 * @returns true if valid
 */
export function isValidCountryTitle(title: string): boolean {
  if (!title || typeof title !== 'string') {
    return false;
  }
  return title.trim().length >= 2 && title.trim().length <= 100;
}

/**
 * Normalize country code to uppercase
 * @param code - Country code
 * @returns Upper-cased code
 */
export function normalizeCountryCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }
  return code.trim().toUpperCase();
}
