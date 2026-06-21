import { describe, expect, it } from 'vitest';
import BranchesModel from '../branches.model';

describe('Stage BranchesModel', () => {
  it('maps nested branch JSON and freezes the instance', () => {
    const model = BranchesModel.fromJson({
      id: 1,
      title: 'Main branch',
      subjects: [{ id: 1, title: 'Math' }],
      e_c_branch_id: 9,
      parent_id: 3,
      children: [{ id: 2, title: 'Child branch', subjects: [] }],
    });

    expect(model).toMatchObject({
      id: 1,
      title: 'Main branch',
      subjects: [{ id: 1, title: 'Math' }],
      e_c_branch_id: 9,
      parent_id: 3,
    });
    expect(model.children?.[0]).toBeInstanceOf(BranchesModel);
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => BranchesModel.fromJson(undefined)).toThrow('Cannot create CountryModel');
    expect(BranchesModel.example).toBeInstanceOf(BranchesModel);
  });
});
