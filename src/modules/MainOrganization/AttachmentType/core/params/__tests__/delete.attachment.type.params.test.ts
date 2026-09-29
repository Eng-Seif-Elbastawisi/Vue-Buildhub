import { describe, expect, it } from 'vitest';
import DeleteAttachmentTypeParams from '../delete.attachment.type.params';

describe('DeleteAttachmentTypeParams', () => {
  it('validates id and maps to map', () => {
    const params = new DeleteAttachmentTypeParams(15);
    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({ attachment_type_id: 15 });
  });
});
