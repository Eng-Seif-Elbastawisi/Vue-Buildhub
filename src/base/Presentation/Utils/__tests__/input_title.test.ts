import { describe, expect, it } from 'vitest';
import {
  hasDescriptionTranslation,
  hasSelectValue,
  hasTitleTranslation,
  requiredSelectRule,
} from '../input_title';

describe('input required helpers', () => {
  it('detects non-empty translated titles', () => {
    expect(hasTitleTranslation({ title: { en: 'Project', ar: '' } })).toBe(true);
    expect(hasTitleTranslation({ title: { en: ' ', ar: '' } })).toBe(false);
  });

  it('detects non-empty translated descriptions', () => {
    expect(hasDescriptionTranslation({ description: { en: '', ar: 'وصف المشروع' } })).toBe(true);
    expect(hasDescriptionTranslation({ description: { en: ' ', ar: '' } })).toBe(false);
  });

  it('detects selected values without rejecting valid zero and false values', () => {
    expect(hasSelectValue(null)).toBe(false);
    expect(hasSelectValue(undefined)).toBe(false);
    expect(hasSelectValue('')).toBe(false);
    expect(hasSelectValue([])).toBe(false);
    expect(hasSelectValue(0)).toBe(true);
    expect(hasSelectValue(false)).toBe(true);
    expect(hasSelectValue({ id: 0, title: 'New client' })).toBe(true);
    expect(hasSelectValue([{ id: 3, title: 'Material' }])).toBe(true);
  });

  it('builds a reusable select required rule', () => {
    const rule = requiredSelectRule();

    expect(rule.required).toBe(true);
    expect(rule.custom?.(undefined)).toBe('Selection is required');
    expect(rule.custom?.(5)).toBe(true);
  });
});
