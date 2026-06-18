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

    expect(service.endpoints.index).toContain('dashboard/fetch_item');
    expect(service.endpoints.create).toContain('dashboard/add_item');
    expect(service.endpoints.update).toContain('dashboard/update_item');
    expect(service.endpoints.delete).toContain('dashboard/delete_item');
  });
});
