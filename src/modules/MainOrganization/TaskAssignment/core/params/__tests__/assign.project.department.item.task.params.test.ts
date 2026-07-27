import { describe, expect, it } from 'vitest';
import AssignProjectDepartmentItemTaskParams from '../assign.project.department.item.task.params';

describe('AssignProjectDepartmentItemTaskParams', () => {
  it('maps the task assignment payload with unique numeric employee ids', () => {
    const params = new AssignProjectDepartmentItemTaskParams({
      project_department_item_id: 39,
      employee_ids: [16, '20', 16],
      employee_review_id: 20,
      duration_type: 1,
      duration: 5,
      notes: '  Review design before delivery.  ',
      has_attached: false,
      attachments: [
        {
          file: 'data:image/jpeg;base64,abc123',
          alt: '  Execution brief  ',
          link: '',
          name: 'brief.jpg',
          type: 'image/jpeg',
          size: '12 KB',
          signature: 'brief.jpg|12000|image/jpeg|1',
        },
      ],
    });

    expect(params.toMap()).toEqual({
      project_department_item_id: 39,
      employee_ids: [16, 20],
      employee_review_id: 20,
      duration_type: 1,
      duration: 5,
      notes: 'Review design before delivery.',
      has_attached: true,
      attachments: [
        {
          file: 'data:image/jpeg;base64,abc123',
          alt: 'Execution brief',
          link: null,
        },
      ],
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires a project department item and at least one employee', () => {
    const params = new AssignProjectDepartmentItemTaskParams({
      project_department_item_id: null,
      employee_ids: [],
      notes: '',
      has_attached: false,
      attachments: [],
    });

    const validation = params.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors.map((error) => error.field)).toEqual([
      'project_department_item_id',
      'employee_ids',
      'duration_type',
      'duration',
    ]);
  });

  it('validates attachment file data URLs and optional links', () => {
    const params = new AssignProjectDepartmentItemTaskParams({
      project_department_item_id: 39,
      employee_ids: [16],
      employee_review_id: 20,
      duration_type: 1,
      duration: 5,
      notes: '',
      has_attached: true,
      attachments: [
        {
          file: 'brief.pdf',
          alt: '',
          link: 'not-a-url',
        },
      ],
    });

    const validation = params.validate();

    expect(params.toMap()).toEqual({
      project_department_item_id: 39,
      employee_ids: [16],
      employee_review_id: 20,
      duration_type: 1,
      duration: 5,
      notes: '',
      has_attached: true,
      attachments: [
        {
          file: 'brief.pdf',
          alt: '',
          link: 'not-a-url',
        },
      ],
    });
    expect(validation.isValid).toBe(false);
    expect(validation.errors.map((error) => error.field)).toEqual([
      'attachments.0.file',
      'attachments.0.link',
    ]);
  });
});
