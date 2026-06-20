import { describe, expect, it } from 'vitest';
import LocationApiService from '../location.api-service';

describe('LocationApiService', () => {
  it('returns the same singleton', () => {
    expect(LocationApiService.getInstance()).toBe(LocationApiService.getInstance());
  });
});
