import { describe, expect, it } from 'vitest';
import SystemIdentityController from '../system.identity.controller';

describe('SystemIdentityController', () => {
  it('uses singleton instances', () => {
    expect(SystemIdentityController.getInstance()).toBe(SystemIdentityController.getInstance());
  });
});
