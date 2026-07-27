import { describe, expect, it } from 'vitest';
import SetTaskEmployeeStatusParams from '../set.task.employee.status.params';
import { TaskEmployeeStatusEnum } from '../../constants/task.employee.status.enum';

describe('SetTaskEmployeeStatusParams', () => {
  it('correctly maps to object payload', () => {
    const params = new SetTaskEmployeeStatusParams({
      project_department_item_id: 15,
      status: TaskEmployeeStatusEnum.START_EMPLOYEE,
      notes: 'Starting task',
    });

    const map = params.toMap();
    expect(map).toEqual({
      project_department_item_id: 15,
      status: TaskEmployeeStatusEnum.START_EMPLOYEE,
      notes: 'Starting task',
    });
  });

  it('correctly converts to FormData with attachments', () => {
    const dummyFile = new File(['test content'], 'test.png', { type: 'image/png' });
    const params = new SetTaskEmployeeStatusParams({
      project_department_item_id: '15',
      status: TaskEmployeeStatusEnum.FINISH_EMPLOYEE,
      notes: 'Finished task',
      attachments: [{ file: dummyFile, alt: 'Proof photo' }],
    });

    const formData = params.toFormData();
    expect(formData.get('project_department_item_id')).toBe('15');
    expect(formData.get('status')).toBe('22');
    expect(formData.get('notes')).toBe('Finished task');
    expect(formData.get('attachments[0][file]')).toEqual(dummyFile);
    expect(formData.get('attachments[0][alt]')).toBe('Proof photo');
  });
});
