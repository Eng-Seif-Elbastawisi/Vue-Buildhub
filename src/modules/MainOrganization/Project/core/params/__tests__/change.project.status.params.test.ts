import { describe, expect, it } from 'vitest';
import { ConvertStatus } from '../../constants/convert.status.enum';
import ChangeProjectStatusParams from '../change.project.status.params';

describe('ChangeProjectStatusParams', () => {
  it('maps project status payload for the API', () => {
    const params = new ChangeProjectStatusParams({
      projectId: 28,
      status: ConvertStatus.ACCEPT_CLIENT,
      notes: 'Client approved',
    });

    expect(params.toMap()).toEqual({
      project_id: 28,
      status: ConvertStatus.ACCEPT_CLIENT,
      notes: 'Client approved',
    });
  });

  it('requires project id and selected status', () => {
    const result = ChangeProjectStatusParams.validation.validate({
      projectId: undefined,
      status: undefined,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        { field: 'projectId', message: 'projectId is required' },
        expect.objectContaining({ field: 'status' }),
      ]),
    );
  });
});
