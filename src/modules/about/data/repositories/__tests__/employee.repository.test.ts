import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import AboutRepository from '../about.repository';

describe('AboutRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(AboutRepository).toBeDefined();
  });

  it('getInstance returns an instance', () => {
    const repo = AboutRepository.getInstance();
    expect(repo).toBeInstanceOf(AboutRepository);
  });
});
