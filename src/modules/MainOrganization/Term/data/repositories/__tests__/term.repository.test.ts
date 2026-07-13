import { describe, expect, it } from 'vitest';
import TermRepository from '../term.repository';

describe('TermRepository', () => {
  it('returns the same singleton', () => {
    expect(TermRepository.getInstance()).toBe(TermRepository.getInstance());
  });
});
