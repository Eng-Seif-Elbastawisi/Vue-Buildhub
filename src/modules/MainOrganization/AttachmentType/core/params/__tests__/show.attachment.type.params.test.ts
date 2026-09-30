import { describe, expect, it } from 'vitest';
import ShowAttachmentTypeParams from '../show.attachment.type.params';

describe('ShowAttachmentTypeParams', () => {
  it('validates id and maps to map', () => {
    const params = new ShowAttachmentTypeParams(20, true);
    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({ attachment_type_id: 20 });
    expect(params.allLocales).toBe(true);
  });
});
