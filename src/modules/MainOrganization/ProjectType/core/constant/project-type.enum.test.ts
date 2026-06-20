import { describe, expect, it } from 'vitest';
import { ProjectType } from './project-type.enum';
describe('ProjectType', () => {
  it('defines supported project types', () => {
    expect(ProjectType.commercial).toBe(4);
    expect(ProjectType.other).toBe(6);
  });
});
