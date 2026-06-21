import { describe, expect, it } from 'vitest';
import DepartmentIdParams from '../department-id.params';

describe('DepartmentIdParams', () => {
  it('serializes the department id', () => {
    expect(new DepartmentIdParams(5).toMap()).toEqual({ id: 5 });
  });
});
