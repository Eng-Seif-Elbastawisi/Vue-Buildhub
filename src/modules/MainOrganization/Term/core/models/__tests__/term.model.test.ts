import { describe, expect, it } from 'vitest';
import TermModel from '../term.model';

describe('TermModel', () => {
  it('maps snake-case API data', () => {
    expect(
      TermModel.fromJson({
        id: 2,
        title: 'Mall',
        translations: [{ locale: 'en', title: 'Mall' }],
      }),
    ).toMatchObject({
      id: 2,
      title: 'Mall',
    });
  });
});
