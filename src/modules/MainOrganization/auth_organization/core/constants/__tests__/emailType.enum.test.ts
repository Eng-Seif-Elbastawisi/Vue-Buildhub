import { describe, expect, it } from 'vitest';
import { EmailType, getEmailTypeNameKey } from '../emailType.enum';

describe('EmailType', () => {
  it('exposes the expected numeric values', () => {
    expect(EmailType).toEqual({
      EMPLOYEE: 1,
      PERSONAL: 2,
      WORK: 3,
      OTHER: 4,
    });
  });

  it('maps email types to translation keys', () => {
    expect(getEmailTypeNameKey(EmailType.EMPLOYEE)).toBe('employee');
    expect(getEmailTypeNameKey(EmailType.PERSONAL)).toBe('personal');
    expect(getEmailTypeNameKey(EmailType.WORK)).toBe('work');
    expect(getEmailTypeNameKey(EmailType.OTHER)).toBe('other');
    expect(getEmailTypeNameKey(999 as EmailType)).toBe('unknown');
  });
});
