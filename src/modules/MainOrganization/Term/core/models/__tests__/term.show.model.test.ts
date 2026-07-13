import { describe, expect, it } from 'vitest';
import TermShowModel from '../term.show.model';

describe('TermShowModel', () => {
  it('maps project details', () => {
    expect(
      TermShowModel.fromJson({
        id: 3,
        title: [{ locale: 'en', title: 'Factory' }],
      }),
    ).toMatchObject({
      id: 3,
      title: 'Factory',
    });
  });
});
