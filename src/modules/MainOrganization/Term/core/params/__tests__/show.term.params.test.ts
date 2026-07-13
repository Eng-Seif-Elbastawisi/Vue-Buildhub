import { describe, expect, it } from 'vitest';
import ShowTermParams from '../show.term.params';

describe('ShowTermParams', () => {
  it('maps project id', () => {
    expect(new ShowTermParams({ termId: 2 }).toMap()).toEqual({
      term_id: 2,
    });
  });
});
