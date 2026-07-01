import { describe, expect, it } from 'vitest';
import { MaterialApiEndpoints } from '../materials.api.endpoints';

describe('MaterialApiEndpoints', () => {
  it('uses main portal material endpoints for admin users', () => {
    const endpoints = new MaterialApiEndpoints();
    expect(endpoints.index).toContain('mainportal/fetch_materials');
    expect(endpoints.store).toContain('mainportal/store_material');
    expect(endpoints.delete).toContain('mainportal/delete_material');
  });
});
