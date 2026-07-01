import { describe, expect, it } from 'vitest';
import ItemApiService from '../Item.api-service';

describe('ItemApiService', () => {
  it('returns the same singleton instance', () => {
    expect(ItemApiService.getInstance()).toBe(ItemApiService.getInstance());
  });

  it('maps base API actions to item endpoints', () => {
    const service = ItemApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_items');
    expect(service.endpoints.create).toContain('mainportal/store_item');
    expect(service.endpoints.update).toContain('mainportal/update_item');
    expect(service.endpoints.delete).toContain('mainportal/delete_item');
  });
});
