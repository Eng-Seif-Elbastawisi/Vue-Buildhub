import { describe, expect, it } from 'vitest';

import { QuoteStatusEnum } from '../../constants/quote.status.enum';
import QuoteStatusModel from '../quote.status.model';

describe('QuoteStatusModel', () => {
  it('maps a quote status transition returned by the history endpoint', () => {
    const history = QuoteStatusModel.fromJson({
      id: 3,
      employee: { id: 1, name: 'Techlab Employee' },
      from_status: 1,
      to_status: 2,
      note: null,
      created_at: '2026-09-30 07:50:08',
    });

    expect(history).toMatchObject({
      id: 3,
      employee: { id: 1, name: 'Techlab Employee' },
      fromStatus: QuoteStatusEnum.DRAFT,
      toStatus: QuoteStatusEnum.PENDING_VALIDATION,
      note: null,
      createdAt: '2026-09-30 07:50:08',
    });
  });
});
