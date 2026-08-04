import { describe, expect, it } from 'vitest';
import { InsideStatusDecision } from '../../constants/inside.status.decision.enum';
import ChangeInsideStatusParams from '../change.inside.status.params';

describe('ChangeInsideStatusParams', () => {
  it('maps the project department item id and numeric decision status', () => {
    const params = new ChangeInsideStatusParams({
      projectDepartmentItemId: 39,
      status: InsideStatusDecision.ACCEPT,
    });

    expect(params.toMap()).toEqual({
      project_department_item_id: 39,
      status: 5,
    });
  });
});
