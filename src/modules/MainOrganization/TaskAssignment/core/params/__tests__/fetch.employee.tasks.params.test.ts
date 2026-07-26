import { describe, expect, it } from 'vitest';
import FetchEmployeeTasksParams from '../fetch.employee.tasks.params';

describe('FetchEmployeeTasksParams', () => {
  it('maps employee task list params with optional project context and pagination', () => {
    expect(
      new FetchEmployeeTasksParams({
        projectId: 24,
        pageNumber: 2,
        perPage: 20,
      }).toMap(),
    ).toEqual({
      with_pagination: 1,
      page: 2,
      per_page: 20,
      project_id: 24,
    });
  });

  it('omits invalid project ids', () => {
    expect(new FetchEmployeeTasksParams({ projectId: 0 }).toMap()).toEqual({
      with_pagination: 1,
      page: 1,
      per_page: 10,
    });
  });
});
