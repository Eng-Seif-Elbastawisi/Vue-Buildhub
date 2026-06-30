import { describe, expect, it } from 'vitest';
import { getStatusNameKey, Status } from '../status.enum';

describe('Status', () => {
  it('maps statuses to i18n keys', () => {
    expect(getStatusNameKey(Status.READY_FOR_PRICING)).toBe('project.status.ready_for_pricing');
    expect(getStatusNameKey(Status.NEED_ADDITIONAL_VISIT)).toBe(
      'project.status.need_additional_visit',
    );
    expect(getStatusNameKey(Status.NOT_READY_FOR_COMPLETION)).toBe(
      'project.status.not_ready_for_completion',
    );
  });
});
