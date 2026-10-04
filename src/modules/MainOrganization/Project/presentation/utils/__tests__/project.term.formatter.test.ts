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
    ).toBe(
      '<p><strong>Payment</strong></p><p>Pay within 30 days</p>' +
        '<p><br></p>' +
        '<p><strong>Delivery</strong></p><p>Delivery within Cairo</p>',
    );
  });

  it('keeps the selected title when a term has no description', () => {
    expect(
      formatSelectedProjectTerms([new TitleInterface<number>({ id: 9, title: 'Warranty' })], []),
    ).toBe('<p><strong>Warranty</strong></p>');
  });

  it('escapes markup before inserting term content into the editor', () => {
    expect(
      formatSelectedProjectTerms(
        [new TitleInterface<number>({ id: 1, title: '<b>Unsafe</b>' })],
        [],
      ),
    ).toBe('<p><strong>&lt;b&gt;Unsafe&lt;/b&gt;</strong></p>');
  });
});
