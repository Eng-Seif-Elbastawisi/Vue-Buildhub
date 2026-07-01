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
  });
});
