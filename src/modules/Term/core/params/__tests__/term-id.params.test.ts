import { describe, expect, it } from 'vitest';
import TermIdParams from '../term-id.params';

describe('TermIdParams', () => {
  it('serializes the term id', () => {
    expect(new TermIdParams(5).toMap()).toEqual({ id: 5 });
  });
});
