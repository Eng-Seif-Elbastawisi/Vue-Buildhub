import { expect, it } from 'vitest';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import ProjectTimelineHistoryModel from '../project.timeline.history.model';
it('maps history with the existing Employee mapper and preserves nulls', () => {
  const item = ProjectTimelineHistoryModel.fromJson({
    id: 1,
    project_timeline_id: 2,
    status: 1,
    reason: null,
    note: null,
    organization_employee: { id: 1, name: 'Techlab Employee', type: 1 },
    created_at: '2026-10-18 12:10:58',
  });
  expect(item.organizationEmployee).toBeInstanceOf(EmployeeModel);
  expect(item.reason).toBeNull();
  expect(item.note).toBeNull();
  expect(item.createdAt).toBe('2026-10-18 12:10:58');
  const withoutEmployee = ProjectTimelineHistoryModel.fromJson({
    id: 2,
    project_timeline_id: 2,
    status: 2,
    reason: 1,
    note: 'Paused',
    organization_employee: null,
    created_at: '2026-10-18 12:12:50',
  });
  expect(withoutEmployee.organizationEmployee).toBeNull();
  expect(withoutEmployee.reason).toBe(1);
});
