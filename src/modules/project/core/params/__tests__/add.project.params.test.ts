import { describe, expect, it } from 'vitest';
import AddProjectParams from '../add.project.params';
describe('AddProjectParams', () => {
  it('maps create data', () => {
    expect(new AddProjectParams({ name: 'Mall', projectType: 4 }).toMap()).toEqual({
      name: 'Mall',
      project_type: 4,
    });
  });
});
