import { describe, expect, it } from 'vitest';
import ShowDepartmentParams from '../show.department.params';

describe('ShowDepartmentParams', () => {
  it('serializes the department id', () => {
    expect(new ShowDepartmentParams({ id: 5 }).toMap()).toEqual({ department_id: 5 });
  });

  it('keeps the allLocales flag for controller headers only', () => {
    const params = new ShowDepartmentParams({ id: 7, allLocales: true });

    expect(params.allLocales).toBe(true);
    expect(params.toMap()).toEqual({ department_id: 7 });
  });
});
