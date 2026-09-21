import { describe, expect, it } from 'vitest';
import ExecutionQuoteRepository from '../execution.quote.repository';

describe('ExecutionQuoteRepository', () => {
  it('returns the same singleton', () => {
    expect(ExecutionQuoteRepository.getInstance()).toBe(ExecutionQuoteRepository.getInstance());
  });
});
