import { describe, expect, it } from 'vitest';
import AttachmentTypeController from '../attachment.type.controller';

describe('AttachmentTypeController', () => {
  it('instantiates as singleton', () => {
    const instance1 = AttachmentTypeController.getInstance();
    const instance2 = AttachmentTypeController.getInstance();
    expect(instance1).toBe(instance2);
  });
});
