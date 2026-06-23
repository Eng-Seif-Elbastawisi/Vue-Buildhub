import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import LocationApiService from '../location.api-service';

describe('LocationApiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns the same singleton', () => {
    expect(LocationApiService.getInstance()).toBe(LocationApiService.getInstance());
  });
});
