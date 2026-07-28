import { describe, expect, it } from 'vitest';

import TaskAssignmentApprovedTaskModel from '../task.assignment.approved-task.model';

describe('TaskAssignmentApprovedTaskModel', () => {
  it('maps approved task rows with department item aliases and assignment state', () => {
    const task = TaskAssignmentApprovedTaskModel.fromJson({
      id: '39',
      uuid: 'approved-39',
      project: { id: '7', title: 'Project A' },
      department: { id: '8', title: 'Design' },
      department_item: { id: '9', title: 'Layout plan' },
      pricing_method: '1',
      quantity: '2',
      price: '1500',
      final_price: '3000',
      duration: '5',
      duration_type: '1',
      inside_status: 'ready',
      is_assign: '0',
      has_attached: false,
      attachments: [{ file: 'data:image/png;base64,abc', alt: '', link: null }],
    });

    expect(task).toBeInstanceOf(TaskAssignmentApprovedTaskModel);
    expect(task.id).toBe(39);
    expect(task.projectName).toBe('Project A');
    expect(task.departmentName).toBe('Design');
    expect(task.itemName).toBe('Layout plan');
    expect(task.departmentItemName).toBe('Layout plan');
    expect(task.quantity).toBe(2);
    expect(task.price).toBe(1500);
    expect(task.finalPrice).toBe(3000);
    expect(task.duration).toBe(5);
    expect(task.durationType).toBe(1);
    expect(task.insideStatus).toBe('ready');
    expect(task.isAssign).toBe(false);
    expect(task.hasAttached).toBe(true);
    expect(task.attachments).toHaveLength(1);
  });
});
