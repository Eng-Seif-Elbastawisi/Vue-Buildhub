import { describe, expect, it } from 'vitest';

import TitleInterface from '@/base/Data/Models/titleInterface';
import TermModel from '@/modules/MainOrganization/Term/core/models/term.model';

import { formatSelectedProjectTerms } from '../project.term.formatter';

describe('formatSelectedProjectTerms', () => {
  it('places each title above its description with space between terms', () => {
    const availableTerms = [
      new TermModel({ id: 1, title: 'Payment', description: 'Pay within 30 days' }),
      new TermModel({ id: 2, title: 'Delivery', description: 'Delivery within Cairo' }),
    ];

    expect(
      formatSelectedProjectTerms(
        [
          new TitleInterface<number>({ id: 1, title: 'Payment' }),
          new TitleInterface<number>({ id: 2, title: 'Delivery' }),
        ],
        availableTerms,
      ),
    ).toBe('Payment\nPay within 30 days\n\nDelivery\nDelivery within Cairo');
  });

  it('keeps the selected title when a term has no description', () => {
    expect(
      formatSelectedProjectTerms([new TitleInterface<number>({ id: 9, title: 'Warranty' })], []),
    ).toBe('Warranty');
  });
});
