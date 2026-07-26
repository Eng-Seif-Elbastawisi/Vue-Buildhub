import { describe, expect, it } from 'vitest';
import TranslationParams, { type LocalizedText } from '../translationParams';

const fallbackCases: Array<[string, LocalizedText, LocalizedText]> = [
  ['missing Arabic', { en: 'Project' }, { en: 'Project', ar: 'Project' }],
  ['missing English', { ar: 'مشروع' }, { ar: 'مشروع', en: 'مشروع' }],
  ['blank Arabic', { en: 'Project', ar: ' ' }, { en: 'Project', ar: 'Project' }],
  ['blank English', { en: ' ', ar: 'مشروع' }, { en: 'مشروع', ar: 'مشروع' }],
];

describe('TranslationParams', () => {
  it.each(fallbackCases)('fills %s title from the provided language', (_scenario, title, expected) => {
    expect(new TranslationParams({ title }).title).toEqual(expected);
  });

  it('preserves distinct English, Arabic, and additional translations', () => {
    const title = { en: 'Project', ar: 'مشروع', fr: 'Projet' };

    expect(new TranslationParams({ title }).title).toEqual(title);
  });
});
