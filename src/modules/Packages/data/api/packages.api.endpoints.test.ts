import { describe, it, expect } from 'vitest';
import { ArticleEndpoints } from './Artical.api.endpoints';

describe('ArticleEndpoints', () => {
  it('should have the correct prefix', () => {
    const endpoints = new ArticleEndpoints();
    expect(endpoints.index).toContain('fetch_packages');
    expect(endpoints.show).toContain('show_package');
    expect(endpoints.store).toContain('store_package');
    expect(endpoints.update).toContain('update_package');
    expect(endpoints.delete).toContain('delete_package');
  });
});
