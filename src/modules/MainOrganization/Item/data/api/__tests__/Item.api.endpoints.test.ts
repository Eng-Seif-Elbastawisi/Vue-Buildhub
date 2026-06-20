import { describe, expect, it } from 'vitest';
import { ItemApiEndpoints } from '../Item.api.endpoints';

describe('ItemApiEndpoints', () => {
  it('uses dashboard item endpoints', () => {
    const endpoints = new ItemApiEndpoints();

    expect(endpoints.index).toContain('dashboard/fetch_item');
    expect(endpoints.show).toContain('dashboard/show_item');
    expect(endpoints.store).toContain('dashboard/add_item');
    expect(endpoints.update).toContain('dashboard/update_item');
    expect(endpoints.delete).toContain('dashboard/delete_item');
  });
});
