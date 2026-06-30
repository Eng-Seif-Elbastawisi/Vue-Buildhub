import { describe, expect, it } from 'vitest';
import DeleteProjectItemParams from '../delete.project.Item.params';

describe('DeleteProjectItemParams', () => {
  it('maps and validates the project item id', () => {
    const params = new DeleteProjectItemParams({ project_item_id: 4 });

    expect(params.toMap()).toEqual({ project_item_id: 4 });
    expect(params.validate().isValid).toBe(true);
    expect(
      new DeleteProjectItemParams({
        project_item_id: undefined as unknown as number,
      }).validate().isValid,
    ).toBe(false);
  });
});
