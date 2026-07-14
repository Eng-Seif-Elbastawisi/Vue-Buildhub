import { describe, expect, it } from 'vitest';
import { NotificationType } from '../../constants/notificationType.enum';
import { Status } from '../../constants/status.enum';
import AddFinalProjectFloorResultParams from '../final.result.project.floor.params';

describe('AddFinalProjectFloorResultParams', () => {
  it('instantiates correctly and converts to map', () => {
    const params = new AddFinalProjectFloorResultParams({
      project_preview_id: 15,
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 7,
      notification_type: NotificationType.URGENT,
      notification_message: 'Please price this floor urgently',
    });

    expect(params.toMap()).toEqual({
      project_preview_id: 15,
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 7,
      notification_type: NotificationType.URGENT,
      notification_message: 'Please price this floor urgently',
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires select values', () => {
    const params = new AddFinalProjectFloorResultParams({
      project_preview_id: 15,
      status: undefined as unknown as Status,
      pricing_responsible_id: undefined as unknown as number,
      notification_type: undefined as unknown as NotificationType,
      notification_message: 'Please price this floor urgently',
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [
        { field: 'status' },
        { field: 'pricing_responsible_id' },
        { field: 'notification_type' },
      ],
    });
  });
});
