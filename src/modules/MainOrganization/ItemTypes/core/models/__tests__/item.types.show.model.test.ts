import { describe, expect, it } from 'vitest';
import ItemTypesShowModel from '../item.types.show.model';

describe('ItemTypesShowModel', () => {
  it('maps an inactive status for the edit form', () => {
    const itemType = ItemTypesShowModel.fromJson({ id: 2, title: 'Material', status: 0 });

    expect(itemType.status).toBe(false);
  });
});
