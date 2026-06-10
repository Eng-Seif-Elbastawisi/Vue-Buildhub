import { describe, it, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import adminRepository from '../admin.repository';

describe('admin.repository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(adminRepository).toBeDefined();
  });
});
