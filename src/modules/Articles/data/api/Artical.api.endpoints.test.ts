import { describe, it, expect } from 'vitest';
import { ArticleEndpoints } from './Artical.api.endpoints';

describe('ArticleEndpoints', () => {
  it('should have the correct prefix', () => {
    const endpoints = new ArticleEndpoints();
    // @ts-expect-error - prefix is protected
    expect(endpoints.prefix).toBe('dashboard/');
  });

  it('should have the correct endpoint URLs', () => {
    const endpoints = new ArticleEndpoints();
    expect(endpoints.index).toContain('fetch_articles');
    expect(endpoints.show).toContain('show_article');
    expect(endpoints.store).toContain('store_article');
    expect(endpoints.update).toContain('update_article');
    expect(endpoints.delete).toContain('delete_article');
  });
});
