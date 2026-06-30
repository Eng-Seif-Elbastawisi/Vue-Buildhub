import { describe, expect, it } from 'vitest';
import ShowProjectItemParams from '../show.project.Item.params';

describe('ShowProjectItemParams', () => {
  it('maps and validates the project item id', () => {
    const params = new ShowProjectItemParams({ project_item_id: 4, allLocales: true });

    expect(params.toMap()).toEqual({ project_item_id: 4 });
    expect(params.allLocales).toBe(true);
    expect(params.validate().isValid).toBe(true);
    expect(
      new ShowProjectItemParams({ project_item_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
