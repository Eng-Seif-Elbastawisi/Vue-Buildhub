import { describe, expect, it } from 'vitest';
import DepartmentModel from '../department.model';

describe('DepartmentModel', () => {
  it('maps the related stage from API data', () => {
    const model = DepartmentModel.fromJson({
      id: 5,
      title: 'Science',
      stage: { id: 2, title: 'Secondary' },
    });

    expect(model.id).toBe(5);
    expect(model.stage.id).toBe(2);
    expect(model.stage.title).toBe('Secondary');
  });
});
