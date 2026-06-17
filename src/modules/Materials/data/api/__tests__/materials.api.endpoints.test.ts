import { describe, expect, it } from 'vitest';
import { MaterialApiEndpoints } from '../materials.api.endpoints';

describe('MaterialApiEndpoints', () => {
  it('uses dashboard endpoints', () => {
    const endpoints = new MaterialApiEndpoints();
    expect(endpoints.index).toContain('dashboard/fetch_material');
    expect(endpoints.store).toContain('dashboard/add_material');
    expect(endpoints.delete).toContain('dashboard/delete_material');
  });
});
