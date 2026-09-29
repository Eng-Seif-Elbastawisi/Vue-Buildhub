import { describe, expect, it } from 'vitest';
import DeleteAttachmentTypeParams from '../delete.attachment.type.params';
import IndexAttachmentTypeParams from '../index.attachment.type.params';
import ShowAttachmentTypeParams from '../show.attachment.type.params';

describe('Attachment Type Other Params', () => {
  it('handles delete params', () => {
    const params = new DeleteAttachmentTypeParams(12);
    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({ attachment_type_id: 12 });
  });

  it('handles show params', () => {
    const params = new ShowAttachmentTypeParams(7, true);
    expect(params.validate().isValid).toBe(true);
    expect(params.toMap()).toEqual({ attachment_type_id: 7 });
  });

  it('handles index params', () => {
    const params = new IndexAttachmentTypeParams('search', 2, 20, 1);
    expect(params.toMap()).toMatchObject({
      word: 'search',
      page: 2,
      per_page: 20,
    });
  });
});
