import { describe, expect, it } from 'vitest';
import ExecutionQuoteApiService from '../execution.quote.api-service';

describe('ExecutionQuoteApiService', () => {
  it('returns the same singleton', () => {
    expect(ExecutionQuoteApiService.getInstance()).toBe(ExecutionQuoteApiService.getInstance());
  });
});
