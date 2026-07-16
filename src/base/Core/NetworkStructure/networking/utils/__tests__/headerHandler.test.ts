import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import HeaderHandler from '../headerHandler';
import { useUserStore } from '@/stores/user';
import UserModel from '@/modules/auth/core/models/user.model';

describe('HeaderHandler', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it.each([undefined, '', 'undefined', 'null', 'Bearer'])(
    'omits Authorization for an unusable token: %s',
    (apiToken) => {
      useUserStore().user = new UserModel({
        name: 'Test User',
        email: 'test@example.com',
        apiToken,
      });

      expect(HeaderHandler.Instance.getHeader(true)).not.toHaveProperty('Authorization');
    },
  );

  it('adds a normalized bearer token only to authenticated requests', () => {
    useUserStore().user = new UserModel({
      name: 'Test User',
      email: 'test@example.com',
      apiToken: '  opaque-token  ',
    });

    expect(HeaderHandler.Instance.getHeader(true).Authorization).toBe('Bearer opaque-token');
    expect(HeaderHandler.Instance.getHeader(false)).not.toHaveProperty('Authorization');
  });

  it('uses the latest saved language for subsequent requests', () => {
    localStorage.setItem('locale', 'en');
    expect(HeaderHandler.Instance.getHeader()['Accept-Language']).toBe('en');

    localStorage.setItem('locale', 'ar');
    expect(HeaderHandler.Instance.getHeader()['Accept-Language']).toBe('ar');
  });
});
