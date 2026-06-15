import { describe, expect, it } from 'vitest';
import { ProjectTypeEnum } from './project.type.enum';
describe('ProjectTypeEnum', () => {
  it('defines supported project types', () => {
    expect(ProjectTypeEnum.commercial).toBe(4);
    expect(ProjectTypeEnum.other).toBe(6);
  });
});
