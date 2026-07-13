import { describe, expect, it } from 'vitest';
import DeleteTermParams from '../delete.term.params';

describe('DeleteTermParams', () => {
  it('maps project id', () => {
    expect(new DeleteTermParams({ termId: 2 }).toMap()).toEqual({
      term_id: 2,
    });
  });
});
