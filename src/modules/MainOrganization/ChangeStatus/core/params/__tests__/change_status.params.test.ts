import { describe, expect, it } from 'vitest';
import { StatusTypeEnum } from '../../constant/change_status.type.enum';
import ChangeStatusParams from '../change_status.params';

describe('ChangeStatusParams', () => {
  it('maps and validates the selected entity type', () => {
    const params = new ChangeStatusParams({
      typeId: 12,
      type: StatusTypeEnum.LABOR,
    });

    expect(params.toMap()).toEqual({
      type_id: 12,
      type: StatusTypeEnum.LABOR,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
