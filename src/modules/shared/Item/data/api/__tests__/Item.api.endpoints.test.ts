import { describe, expect, it } from 'vitest';
import { ItemApiEndpoints } from '../Item.api.endpoints';

describe('ItemApiEndpoints', () => {
  it('uses dashboard item endpoints', () => {
    const endpoints = new ItemApiEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_items');
    expect(endpoints.show).toContain('mainportal/show_item');
    expect(endpoints.store).toContain('mainportal/store_item');
    expect(endpoints.update).toContain('mainportal/update_item');
    expect(endpoints.delete).toContain('mainportal/delete_item');
  });
});
