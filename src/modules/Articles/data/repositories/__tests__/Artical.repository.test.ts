import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ArticleRepository from '../Artical.repository';

describe('ArticleRepository', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should be defined', () => {
    expect(ArticleRepository).toBeDefined();
  });

  it('should get correct singleton instance', () => {
    const instance = ArticleRepository.getInstance();
    expect(instance).toBeInstanceOf(ArticleRepository);
  });
});
