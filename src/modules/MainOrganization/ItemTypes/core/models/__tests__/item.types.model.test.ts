import { describe, expect, it } from 'vitest';
import ItemTypesModel from '../item.types.model';

describe('ItemTypesModel', () => {
  it('maps an active status from the API response', () => {
    const itemType = ItemTypesModel.fromJson({ id: 2, title: 'Material', status: 1 });

    expect(itemType.status).toBe(true);
  });
});
