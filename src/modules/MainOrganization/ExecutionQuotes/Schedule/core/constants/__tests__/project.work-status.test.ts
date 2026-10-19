import { expect, it } from 'vitest';
import { isProjectWorkStatus, ProjectWorkStatus } from '../project.work-status';

it('defines only overall project execution states and keeps null as not started', () => {
  expect(ProjectWorkStatus).toEqual({ START: 1, HOLD: 2, STOP: 3 });
  for (const value of [1, 2, 3]) expect(isProjectWorkStatus(value)).toBe(true);
  for (const value of [null, undefined, 0, 4, '1']) expect(isProjectWorkStatus(value)).toBe(false);
});
