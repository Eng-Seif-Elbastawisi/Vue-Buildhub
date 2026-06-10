import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import PackagesRepository from '../packages.repository';

describe('PackagesRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(PackagesRepository).toBeDefined();
  });

  it('should get correct singleton instance', () => {
    const instance = PackagesRepository.getInstance();
    expect(instance).toBeInstanceOf(PackagesRepository);
  });
});
