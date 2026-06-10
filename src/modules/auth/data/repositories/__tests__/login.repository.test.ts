import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import LoginRepository from '../login.repository';

describe('LoginRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(LoginRepository.getInstance()).toBeDefined();
  });
});
