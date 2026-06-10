/**
 * Email validation utilities - Re-exported from shared base utilities
 * This module maintains backward compatibility by re-exporting shared utilities.
 */

export {
  EMAIL_REGEX,
  MAX_EMAIL_LENGTH,
  MIN_EMAIL_LENGTH,
  isValidEmail,
  normalizeEmail,
  validateAndNormalizeEmail,
  extractEmailDomain,
  isEmailFromDomain,
} from "@/base/Shared/utils/emailValidation";
