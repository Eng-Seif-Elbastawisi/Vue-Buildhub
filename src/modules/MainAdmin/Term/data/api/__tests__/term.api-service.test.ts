import { describe, expect, it } from 'vitest';
import TermApiService from '../term.api-service';

describe('TermApiService', () => {
  it('returns the singleton instance', () => {
    expect(TermApiService.getInstance()).toBe(TermApiService.getInstance());
  });
});
