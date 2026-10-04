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

  it('requires pricing details when the assessment is ready for pricing', () => {
    const params = new AddFinalProjectFloorResultParams({
      project_preview_id: 15,
      status: Status.READY_FOR_PRICING,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [
        { field: 'pricing_responsible_id' },
        { field: 'notification_type' },
        { field: 'notification_message' },
      ],
    });
  });

  it('allows a status-only payload when the assessment is not ready for completion', () => {
    const params = new AddFinalProjectFloorResultParams({
      project_preview_id: 15,
      status: Status.NOT_READY_FOR_COMPLETION,
    });

    expect(params.toMap()).toEqual({
      project_preview_id: 15,
      status: Status.NOT_READY_FOR_COMPLETION,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
