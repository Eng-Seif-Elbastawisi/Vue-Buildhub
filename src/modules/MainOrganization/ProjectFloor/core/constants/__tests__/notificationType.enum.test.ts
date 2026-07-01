import { describe, expect, it } from 'vitest';
import { getNotificationTypeNameKey, NotificationType } from '../notificationType.enum';

describe('NotificationType', () => {
  it('maps notification types to i18n keys', () => {
    expect(getNotificationTypeNameKey(NotificationType.NORMAL)).toBe(
      'project.notificationType.normal',
    );
    expect(getNotificationTypeNameKey(NotificationType.URGENT)).toBe(
      'project.notificationType.urgent',
    );
    expect(getNotificationTypeNameKey(NotificationType.LOW)).toBe('project.notificationType.low');
  });
});
