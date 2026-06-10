import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import SupportRepository from '../support.repository';

describe('SupportRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(SupportRepository).toBeDefined();
  });

  it('getInstance returns an instance', () => {
    const repo = SupportRepository.getInstance();
    expect(repo).toBeInstanceOf(SupportRepository);
  });
});
