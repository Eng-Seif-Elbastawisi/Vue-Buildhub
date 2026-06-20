import { describe, expect, it } from 'vitest';
import ShowItemParams from '../show.Item.params';

describe('ShowItemParams', () => {
  it('maps and validates the item id', () => {
    const params = new ShowItemParams({ item_id: 4, allLocales: true });

    expect(params.toMap()).toEqual({ item_id: 4 });
    expect(params.allLocales).toBe(true);
    expect(params.validate().isValid).toBe(true);
    expect(new ShowItemParams({ item_id: null as unknown as number }).validate().isValid).toBe(
      false,
    );
  });
});
