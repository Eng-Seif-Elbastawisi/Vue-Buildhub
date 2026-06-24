import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import LoginRepository from '@/modules/MainAdmin/auth_admin/data/repositories/login.repository';

describe('LoginRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(LoginRepository.getInstance()).toBeDefined();
  });
});
