import { describe, expect, it } from 'vitest';
import { StatusTypeEnum } from '../../constant/change_status.type.enum';
import ChangeStatusModel from '../client.model';

describe('ChangeStatusModel', () => {
  it('maps a supported status type', () => {
    const status = ChangeStatusModel.fromJson({
      id: 12,
      type: StatusTypeEnum.PRODUCT,
    });

    expect(status).toMatchObject({ id: 12, type: StatusTypeEnum.PRODUCT });
  });
});
