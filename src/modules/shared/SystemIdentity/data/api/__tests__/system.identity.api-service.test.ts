import { describe, expect, it } from 'vitest';
import SystemIdentityApiService from '../system.identity.api-service';

describe('SystemIdentityApiService', () => {
  it('uses singleton instances', () => {
    expect(SystemIdentityApiService.getInstance()).toBe(SystemIdentityApiService.getInstance());
  });
});
