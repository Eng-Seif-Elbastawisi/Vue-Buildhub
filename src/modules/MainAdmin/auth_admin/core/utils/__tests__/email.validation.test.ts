import { describe, expect, it } from 'vitest';
import {
  extractEmailDomain,
  isEmailFromDomain,
  isValidEmail,
  normalizeEmail,
  validateAndNormalizeEmail,
} from '../email.validation';

describe('email.validation exports', () => {
  it('re-exports the shared email validation helpers', () => {
    expect(isValidEmail('User@Example.com')).toBe(true);
    expect(normalizeEmail(' User@Example.com ')).toBe('user@example.com');
    expect(validateAndNormalizeEmail(' User@Example.com ')).toBe('user@example.com');
    expect(extractEmailDomain('user@example.com')).toBe('example.com');
    expect(isEmailFromDomain('user@example.com', 'example.com')).toBe(true);
  });
});
