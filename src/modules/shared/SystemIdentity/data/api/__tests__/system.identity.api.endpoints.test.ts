import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { SystemIdentityApiEndpoints } from '../system.identity.api.endpoints';

describe('SystemIdentityApiEndpoints', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('defines system identity endpoints', () => {
    const endpoints = new SystemIdentityApiEndpoints();

    expect(endpoints.show).toContain('show_setting');
    expect(endpoints.store).toContain('store_setting');
  });
});
