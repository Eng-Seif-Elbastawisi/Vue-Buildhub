import { describe, expect, it } from 'vitest';
import { Type, getTypeNameKey } from '../Type.enum';

describe('department Type constants', () => {
  it.each([
    [Type.DESIGN, 'types.design'],
    [Type.SUPERVISION, 'types.supervision'],
    [Type.BOTH, 'types.both'],
  ])('maps type %s to its i18n key', (type, key) => {
    expect(getTypeNameKey(type)).toBe(key);
  });

  it('returns unknown for unsupported types', () => {
    expect(getTypeNameKey(0 as Type)).toBe('unknown');
  });
});
