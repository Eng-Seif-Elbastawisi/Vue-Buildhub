import { describe, expect, it } from 'vitest';
import ExecutionQuoteController from '../execution.quote.controller';

describe('ExecutionQuoteController', () => {
  it('returns the same singleton', () => {
    expect(ExecutionQuoteController.getInstance()).toBe(ExecutionQuoteController.getInstance());
  });
});
