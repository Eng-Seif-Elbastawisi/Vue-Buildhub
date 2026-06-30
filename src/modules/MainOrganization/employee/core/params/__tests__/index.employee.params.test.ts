import { describe, expect, it } from 'vitest';
import IndexEmployeeParams from '../index.employee.params';

describe('IndexEmployeeParams', () => {
  it('should include employee type when provided', () => {
    const params = new IndexEmployeeParams('', 1, 100, 0, 2);

    expect(params.toMap()).toMatchObject({
      page: 1,
      per_page: 100,
      with_pagination: 0,
      type: 2,
    });
  });

  it('should omit employee type when not provided', () => {
    const params = new IndexEmployeeParams('', 1, 10, 1);

    expect(params.toMap()).not.toHaveProperty('type');
  });
});
