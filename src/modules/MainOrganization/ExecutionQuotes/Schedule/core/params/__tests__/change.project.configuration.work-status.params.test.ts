import { expect, it } from 'vitest';
import ChangeProjectConfigurationWorkStatusParams from '../change.project.configuration.work-status.params';

it('serializes initial START using only the confirmed backend keys', () => {
  const params = new ChangeProjectConfigurationWorkStatusParams(140, 1, 9);
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap()).toEqual({ quote_id: 140, work_status: 1, responsible_employee_id: 9 });
});

it.each([1, 2, 3] as const)(
  'omits the employee for later status %s to preserve the assignment',
  (status) => {
    const params = new ChangeProjectConfigurationWorkStatusParams(140, status);
    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({ quote_id: 140, work_status: status });
  },
);

it('rejects invalid owner and employee identifiers', () => {
  expect(new ChangeProjectConfigurationWorkStatusParams(0, 1, 9).validate().isValid).toBe(false);
  expect(new ChangeProjectConfigurationWorkStatusParams(140, 1, -9).validate().isValid).toBe(false);
});
