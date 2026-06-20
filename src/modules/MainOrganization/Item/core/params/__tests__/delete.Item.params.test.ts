import { describe, expect, it } from 'vitest';
import DeleteItemParams from '../delete.Item.params';

describe('DeleteItemParams', () => {
  it('maps and validates the item id', () => {
    const params = new DeleteItemParams({ item_id: 4 });

    expect(params.toMap()).toEqual({ item_id: 4 });
    expect(params.validate().isValid).toBe(true);
    expect(
      new DeleteItemParams({ item_id: undefined as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
