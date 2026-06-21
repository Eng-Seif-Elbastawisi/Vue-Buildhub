import { describe, expect, it } from 'vitest';
import AddProjectTypeParams from '../add.project-type.params';
describe('AddProjectTypeParams', () => {
  it('maps create data', () => {
    expect(new AddProjectTypeParams({ name: 'Mall', projectType: 4 }).toMap()).toEqual({
      name: 'Mall',
      project_type: 4,
    });
  });
});
