import { describe, expect, it } from 'vitest';

import ExecutionQuoteAttachmentModel from '../execution.quote.attachment.model';

describe('ExecutionQuoteAttachmentModel', () => {
  it('maps attachment fields from the API response', () => {
    const attachment = ExecutionQuoteAttachmentModel.fromJson({
      id: 9,
      file: 'https://cdn.example.com/site-plan.png',
      file_size: '2 MB',
      alt: 'Site plan',
      link: null,
      created_at: '2026-09-23 12:42:35',
    });

    expect(attachment).toMatchObject({
      id: 9,
      file: 'https://cdn.example.com/site-plan.png',
      fileSize: '2 MB',
      alt: 'Site plan',
      link: null,
      createdAt: '2026-09-23 12:42:35',
    });
  });
});
