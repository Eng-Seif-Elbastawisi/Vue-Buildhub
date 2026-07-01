import { describe, expect, it } from 'vitest';
import SystemIdentityRepository from '../system.identity.repository';

describe('SystemIdentityRepository', () => {
  it('uses singleton instances', () => {
    expect(SystemIdentityRepository.getInstance()).toBe(SystemIdentityRepository.getInstance());
  });
});
