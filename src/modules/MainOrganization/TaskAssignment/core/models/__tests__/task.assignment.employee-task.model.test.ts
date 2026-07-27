import { describe, expect, it } from 'vitest';
import TaskAssignmentEmployeeTaskModel from '../task.assignment.employee-task.model';

describe('TaskAssignmentEmployeeTaskModel', () => {
  it('maps returned task fields without requiring mocked backend-only fields', () => {
    const task = TaskAssignmentEmployeeTaskModel.fromJson({
      id: 7,
      task_name: 'Design review',
      project: { id: 24, title: [{ locale: 'en', title: 'Commercial project' }] },
      project_department_item: {
        id: 39,
        item: { id: 5, title: 'Layout plan' },
        title: 'Layout plan',
      },
      employees: [
        { id: 16, name: 'Mohamed Saad' },
        { id: 20, name: 'Sara Ali' },
      ],
      notes: 'Review before delivery',
      status: 'pending',
      status_label: 'Pending',
      created_at: '2026-07-26',
      due_date: '2026-07-29',
      available_statuses: [
        { id: 'in_progress', title: 'In progress' },
        { id: 'done', title: 'Done' },
      ],
      status_update_action: 'update_employee_task_status',
    });

    expect(task.id).toBe(7);
    expect(task.title).toBe('Design review');
    expect(task.projectName).toBe('Commercial project');
    expect(task.departmentItemName).toBe('Layout plan');
    expect(task.assignedEmployees).toEqual([
      { id: 16, name: 'Mohamed Saad' },
      { id: 20, name: 'Sara Ali' },
    ]);
    expect(task.statusLabel).toBe('Pending');
    expect(task.availableStatuses).toEqual([
      { id: 'in_progress', title: 'In progress' },
      { id: 'done', title: 'Done' },
    ]);
    expect(task.statusUpdateAction).toBe('update_employee_task_status');
  });
});
