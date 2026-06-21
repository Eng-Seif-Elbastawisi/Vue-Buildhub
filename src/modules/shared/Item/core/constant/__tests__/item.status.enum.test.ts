import { describe, expect, it } from 'vitest';
import { ItemStatusEnum } from '../item.status.enum';

describe('ItemStatusEnum', () => {
  it('exposes stable item status ids', () => {
    expect(ItemStatusEnum).toEqual({ MAIN: 1, OPTIONAL: 2 });
  });
});
