import { describe, expect, test } from 'vitest';
import arabicMessages from '@/locales/ar.json';
import englishMessages from '@/locales/en.json';
import { getTypeNameKey, InsideStatusType } from '../inside.status.enum';

describe('InsideStatusType', () => {
  test.each([
    [InsideStatusType.ASSIGN, 'task_assignment.inside.assigned', 'مُكَلَّف', 'Assigned'],
    [InsideStatusType.WORKING, 'task_assignment.inside.working', 'تحت التنفيذ', 'Working'],
    [InsideStatusType.HOLD, 'task_assignment.inside.hold', 'متوقف', 'Hold'],
    [InsideStatusType.REVIEW, 'task_assignment.inside.review', 'قيد المراجعة', 'Review'],
  ])('uses a localized key for status %s', (status, translationKey, arabicLabel, englishLabel) => {
    expect(getTypeNameKey(status)).toBe(translationKey);
    expect(arabicMessages[translationKey]).toBe(arabicLabel);
    expect(englishMessages[translationKey]).toBe(englishLabel);
  });

  test('provides the detail-page title in Arabic and English', () => {
    expect(arabicMessages['task_assignment.show_title']).toBe('عرض إسناد المهمة');
    expect(englishMessages['task_assignment.show_title']).toBe('Task assignment details');
  });
});
