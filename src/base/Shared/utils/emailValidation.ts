/**
 * Email validation utilities - Shared across all modules
 */

/**
 * Regular expression for validating email format
 * Follows RFC 5322 simplified pattern
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Maximum length for email addresses
 */
export const MAX_EMAIL_LENGTH = 254;

/**
 * Minimum length for email addresses
 */
export const MIN_EMAIL_LENGTH = 3;

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const trimmedEmail = email.trim();

    // Check length constraints
    if (trimmedEmail.length < MIN_EMAIL_LENGTH || trimmedEmail.length > MAX_EMAIL_LENGTH) {
        return false;
    }

    // Check format using regex
    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return false;
    }

    // Additional validation: ensure there's exactly one @ symbol
    const atSymbols = trimmedEmail.split('@').length - 1;
    if (atSymbols !== 1) {
        return false;
    }

    // Validate domain part has at least one dot
    const [, domain] = trimmedEmail.split('@');
    if (!domain || !domain.includes('.')) {
        return false;
    }

    return true;
}

/**
 * Normalize email address (lowercase and trim)
 * @param email - Email to normalize
 * @returns Normalized email
 */
export function normalizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
        return '';
    }
    return email.trim().toLowerCase();
}

/**
 * Validate and normalize email
 * @param email - Email to validate and normalize
 * @returns Normalized email if valid
 * @throws Error if email is invalid
 */
export function validateAndNormalizeEmail(email: string): string {
    const normalized = normalizeEmail(email);

    if (!isValidEmail(normalized)) {
        throw new Error(`Invalid email format: ${email}`);
    }

    return normalized;
}

/**
 * Extract domain from email address
 * @param email - Email address
 * @returns Domain part of email or empty string if invalid
 */
export function extractEmailDomain(email: string): string {
    if (!isValidEmail(email)) {
        return '';
    }

    const parts = email.split('@');
    return parts[1] || '';
}

/**
 * Check if email belongs to a specific domain
 * @param email - Email to check
 * @param domain - Domain to check against
 * @returns true if email belongs to domain
 */
export function isEmailFromDomain(email: string, domain: string): boolean {
    const emailDomain = extractEmailDomain(email);
    return emailDomain.toLowerCase() === domain.toLowerCase();
}
