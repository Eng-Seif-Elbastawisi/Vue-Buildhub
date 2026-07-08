import { describe, expect, it } from 'vitest';

import { normalizeFieldHelpKey, resolveFieldHelpContent } from '../fieldHelpRegistry';

const messages: Record<string, string> = {
  'field_help.default_title': 'Field help',
  'field_help.important_title': "Why it's important?",
  'field_help.default_importance': 'This keeps {field} easy to use in workflows.',
  'field_help.title.title': 'Title',
  'field_help.title.text': 'Use a clear title.',
  title: 'العنوان',
};

const translate = (key: string, params?: Record<string, string>) => {
  const message = messages[key] ?? key;

  return Object.entries(params ?? {}).reduce(
    (result, [paramKey, value]) => result.replace(`{${paramKey}}`, value),
    message,
  );
};

describe('fieldHelpRegistry', () => {
  it('normalizes common label values', () => {
    expect(normalizeFieldHelpKey('Project Type')).toBe('project_type');
    expect(normalizeFieldHelpKey('material.price')).toBe('material_price');
  });

  it('prefers explicit help content', () => {
    const result = resolveFieldHelpContent({
      label: 'Anything',
      helpTitle: 'Custom title',
      helpText: 'Custom text',
      helpExamples: ['Example'],
      translate,
    });

    expect(result).toMatchObject({
      title: 'Custom title',
      text: 'Custom text',
      importantTitle: "Why it's important?",
      importantText: 'This keeps Custom title easy to use in workflows.',
      tip: '',
      icon: 'pi pi-info-circle',
      examples: ['Example'],
    });
  });

  it('resolves registry help by field name', () => {
    const result = resolveFieldHelpContent({
      fieldName: 'title',
      translate,
    });

    expect(result?.title).toBe('Title');
    expect(result?.text).toBe('Use a clear title.');
    expect(result?.importantText).toBe('This keeps Title easy to use in workflows.');
  });

  it('resolves registry help from localized label text', () => {
    const result = resolveFieldHelpContent({
      label: 'العنوان',
      translate,
    });

    expect(result?.title).toBe('Title');
  });

  it('returns null when help is disabled', () => {
    const result = resolveFieldHelpContent({
      showHelp: false,
      fieldName: 'title',
      translate,
    });

    expect(result).toBeNull();
  });
});
